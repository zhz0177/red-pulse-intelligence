<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- 返回 -->
    <button @click="$router.back()" class="mb-4 text-sm text-stone-500 hover:text-red-900 transition bg-transparent border-0 cursor-pointer">
      ← 返回
    </button>

    <div class="flex flex-col md:flex-row gap-4 md:gap-6">
      <!-- 左侧: 照片瀑布流 -->
      <div class="flex-1">
        <div class="bg-red-900 text-white rounded-t-xl p-5">
          <h2 class="text-xl font-bold">{{ martyr?.name }} · 影像记忆</h2>
          <p class="text-white/70 text-sm mt-1">珍贵历史照片存档</p>
        </div>
        <div class="bg-white rounded-b-xl border border-stone-200 p-6">
          <!-- 瀑布流 -->
          <div class="columns-1 md:columns-2 gap-4 space-y-4">
            <div
              v-for="(photo, index) in photos"
              :key="index"
              class="break-inside-avoid group cursor-pointer"
              @click="selectPhoto(photo)"
            >
              <div class="relative overflow-hidden rounded-lg border-2 shadow-sm hover:shadow-lg transition" :class="selectedPhoto === photo ? 'border-red-900' : 'border-stone-200'">
                <img :src="photo.url" :alt="photo.desc" class="w-full object-cover" loading="lazy" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <p class="absolute bottom-2 left-3 right-3 text-white text-xs">{{ photo.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!photos.length" class="text-center py-12">
            <div class="text-4xl mb-3">📷</div>
            <p class="text-stone-400">暂无照片</p>
          </div>
        </div>
      </div>

      <!-- 右侧: AI 智能讲解 -->
      <aside class="w-full md:w-80 md:flex-shrink-0">
        <div class="md:sticky md:top-24 space-y-4">
          <!-- AI 讲解视窗 -->
          <div class="bg-white rounded-xl shadow-md border border-amber-700/20 overflow-hidden">
            <div class="bg-gradient-to-r from-red-900 to-red-800 text-white p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-bold flex items-center gap-2">
                  <span class="text-lg">🤖</span> AI 智能讲解
                </h3>
                <!-- 语音开关 -->
                <button
                  @click="toggleSound"
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition border-0 cursor-pointer"
                  :class="soundEnabled ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'"
                  :title="soundEnabled ? '关闭语音' : '开启语音'"
                >
                  <svg v-if="soundEnabled" viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                  <span>{{ soundEnabled ? (isSpeaking ? '朗读中' : '点击朗读') : '语音' }}</span>
                </button>
              </div>
              <p class="text-xs text-white/70 mt-1">{{ selectedPhoto ? '正在解读选中照片' : '基于历史资料的智能解读' }}</p>
            </div>
            <div class="p-4">
              <div class="bg-stone-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                <div v-if="aiLoading" class="flex items-center gap-2 text-sm text-stone-500">
                  <span class="animate-pulse">●</span>
                  <span class="animate-pulse">●</span>
                  <span class="animate-pulse">●</span>
                  <span class="ml-1">AI 正在解读中...</span>
                </div>
                <p v-else class="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{{ aiExplanation }}<span v-if="aiStreaming" class="inline-block w-1.5 h-4 bg-red-900 ml-0.5 animate-pulse align-middle"></span></p>
              </div>
              <!-- 重新生成按钮 -->
              <button
                v-if="!aiLoading && !aiStreaming && aiExplanation"
                @click="generateAI()"
                class="mt-3 w-full text-xs text-stone-500 hover:text-red-900 transition bg-transparent border border-stone-200 rounded-lg py-2 cursor-pointer hover:border-red-900"
              >
                换一种讲解
              </button>
            </div>
          </div>

          <!-- 选中照片详情 -->
          <div v-if="selectedPhoto" class="bg-white rounded-xl shadow-md border border-amber-700/20 p-4">
            <img :src="selectedPhoto.url" :alt="selectedPhoto.desc" class="w-full rounded-lg mb-3" />
            <p class="text-sm text-stone-700 font-medium">{{ selectedPhoto.desc }}</p>
          </div>

          <!-- 时间轴 -->
          <div class="bg-white rounded-xl shadow-md border border-amber-700/20 p-5">
            <h3 class="text-sm font-bold text-red-900 mb-3">生命轨迹</h3>
            <Timeline :timeline="martyr?.timeline || []" />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useMartyrStore } from '../../stores/martyr'
import { chatStream } from '../../api/ai'
import { getHeroPhotos } from '../../config/heroPhotos'
import Timeline from '../../components/Timeline.vue'

const route = useRoute()
const martyrStore = useMartyrStore()
const selectedPhoto = ref(null)
const aiLoading = ref(true)
const aiStreaming = ref(false)
const aiExplanation = ref('')
const soundEnabled = ref(false)
const isSpeaking = ref(false)

const martyrId = computed(() => Number(route.params.martyrId))
const martyr = computed(() => martyrStore.currentMartyr || martyrStore.martyrs.find(m => m.id === martyrId.value))
const letter = computed(() => martyrStore.currentLetter)
const photos = computed(() => {
  // 始终使用本地照片配置，确保每位先烈只加载自己拼音文件夹下的照片
  return getHeroPhotos(martyrId.value)
})

function selectPhoto(photo) {
  selectedPhoto.value = photo
  generateAI(photo)
}

// 构建 AI 提示词
function buildPrompt(photo) {
  const m = martyr.value
  const l = letter.value
  if (!m) return null

  let prompt = ''
  if (photo) {
    prompt = `请详细讲解这张历史照片。

照片描述：${photo.desc}
烈士：${m.name}
生平简介：${m.bio}
${l?.content ? '相关家书内容：' + l.content.substring(0, 200) : ''}

请从以下角度展开讲解（300-500字）：
1. 照片的历史背景和拍摄场景
2. 照片中蕴含的革命精神和历史意义
3. 与烈士生平事迹的关联
4. 对当代青年的启示`
  } else {
    const photoDescs = photos.value.map(p => p.desc).join('、')
    prompt = `请为"${m.name}"的影像记忆页面做一段详细的智能讲解。

烈士：${m.name}
生平简介：${m.bio}
${l?.content ? '家书内容摘要：' + l.content.substring(0, 300) : ''}
${photoDescs ? '现有照片：' + photoDescs : ''}
${l?.ai_explanation ? '基础解读：' + l.ai_explanation : ''}

请从以下角度展开讲解（400-600字）：
1. 烈士的生平事迹与革命贡献
2. 家书中蕴含的家国情怀和革命信念
3. 这些影像资料的历史价值和文化意义
4. 烈士精神对当代青年的启示与感召`
  }
  return prompt
}

// 调用 Kimi API 生成讲解
async function generateAI(photo = null) {
  const prompt = buildPrompt(photo)
  if (!prompt) {
    aiExplanation.value = letter.value?.ai_explanation || '暂无讲解内容。'
    aiLoading.value = false
    return
  }

  stopSpeech()
  aiExplanation.value = ''
  aiLoading.value = true
  aiStreaming.value = false

  try {
    const messages = [{ role: 'user', content: prompt }]
    aiLoading.value = false
    aiStreaming.value = true

    await chatStream(messages, (chunk) => {
      aiExplanation.value += chunk
    })

    aiStreaming.value = false

    // 移除自动朗读: 移动端 speechSynthesis 必须在用户点击手势内触发
    // 用户需要手动点击语音按钮来朗读
  } catch {
    aiStreaming.value = false
    if (!aiExplanation.value) {
      // API 失败时回退到静态文本
      aiExplanation.value = letter.value?.ai_explanation || '暂无讲解内容，请检查网络连接后重试。'
    }
    aiLoading.value = false
  }
}

// === 语音朗读 (兼容移动端) ===
function speakText(text) {
  if (!window.speechSynthesis || !text) return
  stopSpeech()

  // 移动端: 分段朗读防止长文本中断
  const maxLen = 200
  const segments = []
  for (let i = 0; i < text.length; i += maxLen) {
    segments.push(text.substring(i, i + maxLen))
  }

  let idx = 0
  function speakNext() {
    if (idx >= segments.length || !soundEnabled.value) {
      isSpeaking.value = false
      return
    }
    const utterance = new SpeechSynthesisUtterance(segments[idx])
    utterance.lang = 'zh-CN'
    utterance.rate = 0.9
    utterance.pitch = 1.0

    const voices = speechSynthesis.getVoices()
    const zhVoice = voices.find(v => v.lang.startsWith('zh'))
    if (zhVoice) utterance.voice = zhVoice

    utterance.onend = () => { idx++; speakNext() }
    utterance.onerror = () => { isSpeaking.value = false }

    speechSynthesis.speak(utterance)
  }

  isSpeaking.value = true
  speakNext()
}

function stopSpeech() {
  if (window.speechSynthesis) {
    speechSynthesis.cancel()
    isSpeaking.value = false
  }
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  if (soundEnabled.value) {
    // 开启语音：如果已有内容且未在生成中，立即朗读（用户手势触发，移动端兼容）
    if (aiExplanation.value && !aiStreaming.value) {
      speakText(aiExplanation.value)
    }
  } else {
    stopSpeech()
  }
}

onMounted(async () => {
  // 预加载语音列表
  if (window.speechSynthesis) {
    speechSynthesis.getVoices()
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices()
  }

  if (!martyrStore.martyrs.length) {
    await martyrStore.fetchMartyrs()
  }
  await martyrStore.fetchLetter(martyrId.value)

  // 生成整体讲解
  generateAI()
})

onBeforeUnmount(() => {
  stopSpeech()
})
</script>
