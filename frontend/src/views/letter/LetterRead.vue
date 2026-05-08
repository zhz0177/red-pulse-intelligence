<template>
  <div class="max-w-5xl mx-auto px-4 py-4 md:py-8">
    <div class="flex flex-col md:flex-row gap-4 md:gap-8">
      <!-- 左侧: 家书内容 -->
      <div class="flex-1">
        <!-- 返回按钮 -->
        <button @click="$router.back()" class="mb-4 text-sm text-stone-500 hover:text-red-900 transition bg-transparent border-0 cursor-pointer">
          ← 返回地图
        </button>

        <!-- 烈士信息卡 -->
        <div class="bg-red-900 text-white rounded-t-xl p-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {{ martyr?.name?.charAt(0) }}
            </div>
            <div>
              <h2 class="text-2xl font-bold">{{ martyr?.name }}</h2>
              <p class="text-white/70 text-sm mt-1">{{ martyr?.tracks }}</p>
            </div>
          </div>
        </div>

        <!-- 烈士生平简介 -->
        <div class="bg-white border-x border-stone-200 p-6">
          <h3 class="text-base font-bold text-red-900 mb-3 flex items-center gap-2">
            <span>📖</span> 烈士生平
          </h3>
          <p class="text-sm text-stone-600 leading-relaxed">{{ martyr?.bio }}</p>

          <div v-if="martyr?.family_status" class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 class="text-sm font-bold text-amber-800 mb-1">家庭状况</h4>
            <p class="text-sm text-amber-700">{{ martyr.family_status }}</p>
          </div>
        </div>

        <!-- 家书正文 -->
        <div class="paper-bg p-8 mx-2">
          <h3 class="text-center text-lg font-bold text-red-900 mb-6" style="font-family: 'KaiTi', 'STKaiti', serif">
            家 书
          </h3>
          <div class="text-base leading-loose text-stone-800 whitespace-pre-line" style="font-family: 'KaiTi', 'STKaiti', serif">
            {{ letter?.content }}
          </div>
        </div>

        <!-- 回信区域 -->
        <div class="bg-white border border-stone-200 rounded-b-xl p-6">
          <h3 class="text-base font-bold text-red-900 mb-3 flex items-center gap-2">
            <span>✉️</span> 写一封回信
          </h3>
          <p class="text-xs text-stone-400 mb-3">读完家书后，写下你想对先烈说的话</p>
          <textarea
            v-model="replyContent"
            rows="5"
            class="w-full border border-stone-300 rounded-lg p-4 text-sm resize-none focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900"
            placeholder="写下你的感悟与敬意..."
            style="font-family: 'KaiTi', 'STKaiti', serif"
          ></textarea>
          <div class="flex items-center justify-between mt-3">
            <span class="text-xs text-stone-400">{{ replyContent.length }}/500</span>
            <button @click="submitReply" :disabled="!replyContent.trim() || submitting" class="btn-red text-sm disabled:opacity-50">
              {{ submitting ? '提交中...' : '提交回信' }}
            </button>
          </div>
          <!-- 已有回信 -->
          <div v-if="replies.length" class="mt-6 border-t border-stone-200 pt-4">
            <h4 class="text-sm font-bold text-stone-700 mb-3">回信留言 ({{ replies.length }})</h4>
            <div v-for="r in replies" :key="r.id" class="mb-3 p-3 bg-stone-50 rounded-lg">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-red-900">{{ r.username || '匿名志愿者' }}</span>
                <span class="text-xs text-stone-400">{{ r.created_at }}</span>
              </div>
              <p class="text-sm text-stone-600" style="font-family: 'KaiTi', 'STKaiti', serif">{{ r.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧: 时间轴 -->
      <aside class="w-full md:w-72 md:flex-shrink-0">
        <div class="md:sticky md:top-24">
          <div class="bg-white rounded-xl shadow-md border border-amber-700/20 p-5">
            <h3 class="text-base font-bold text-red-900 mb-4 flex items-center gap-2">
              <span>📅</span> 生命轨迹
            </h3>
            <Timeline :timeline="martyr?.timeline || []" />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMartyrStore } from '../../stores/martyr'
import { getReplies, replyLetter } from '../../api/martyr'
import Timeline from '../../components/Timeline.vue'
import { useShopStore } from '../../stores/shop'

const route = useRoute()
const martyrStore = useMartyrStore()
const replyContent = ref('')
const submitting = ref(false)
const replies = ref([])

const martyrId = computed(() => Number(route.params.martyrId))
const martyr = computed(() => martyrStore.currentMartyr || martyrStore.martyrs.find(m => m.id === martyrId.value))
const letter = computed(() => martyrStore.currentLetter)
const shopStore = useShopStore()

onMounted(async () => {
  if (!martyrStore.martyrs.length) {
    await martyrStore.fetchMartyrs()
  }
  await martyrStore.fetchLetter(martyrId.value)
  await loadReplies()
})

async function loadReplies() {
  const letterId = letter.value?.id
  if (!letterId) return
  try {
    const res = await getReplies(letterId)
    replies.value = res.data || []
  } catch {
    replies.value = []
  }
}

async function submitReply() {
  if (!replyContent.value.trim()) return
  submitting.value = true
  try {
    await replyLetter(letter.value?.id, replyContent.value)
    // 红迹地图 → 提交家书：+20 传承豆
    await shopStore.earn('letter_reply')
    replyContent.value = ''
    await loadReplies()
  } catch {
    // API 失败时本地追加
    replies.value.unshift({
      id: Date.now(),
      username: JSON.parse(localStorage.getItem('user') || '{}').username || '匿名用户',
      content: replyContent.value,
      created_at: new Date().toLocaleDateString('zh-CN')
    })
    replyContent.value = ''
  }
  submitting.value = false
}
</script>
