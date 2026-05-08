<template>
  <!-- 磨砂玻璃遮罩 -->
  <Transition name="overlay-fade">
    <div
      v-if="chatOpen"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
      @click="chatOpen = false"
    ></div>
  </Transition>

  <!-- 小精灵主体 -->
  <div
    ref="mascotRoot"
    class="fixed z-[9999] flex flex-col items-end gap-3"
    :style="rootStyle"
  >

    <!-- 聊天面板 -->
    <Transition name="chat-slide">
      <div
        v-if="chatOpen"
        class="w-80 md:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-red-200 overflow-hidden flex flex-col"
        style="max-height: 480px;"
      >
        <!-- 标题栏 -->
        <div class="bg-gradient-to-r from-red-900 to-red-700 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img :src="mascotImg" class="w-7 h-7 rounded-full border border-white/50 object-cover" />
            <span class="text-white text-sm font-bold">红色文化小助手</span>
          </div>
          <button @click="chatOpen = false" class="text-white/70 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <!-- 消息列表 -->
        <div ref="msgBox" class="flex-1 overflow-y-auto px-4 py-3 space-y-3" style="min-height: 200px; max-height: 320px;">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'"
          >
            <div
              :class="[
                'max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-red-900 text-white rounded-br-sm'
                  : 'bg-stone-100 text-stone-800 rounded-bl-sm'
              ]"
            >{{ msg.content }}</div>
          </div>
          <div v-if="loading" class="flex justify-start">
            <div class="bg-stone-100 text-stone-500 px-3 py-2 rounded-xl rounded-bl-sm text-sm">
              <span class="inline-flex gap-1">
                <span class="animate-bounce" style="animation-delay:0ms">.</span>
                <span class="animate-bounce" style="animation-delay:150ms">.</span>
                <span class="animate-bounce" style="animation-delay:300ms">.</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 输入框 -->
        <div class="border-t border-stone-200 px-3 py-2 flex gap-2">
          <input
            v-model="userInput"
            @keyup.enter="sendMessage"
            placeholder="问我关于红色文化的问题..."
            class="flex-1 text-sm px-3 py-2 rounded-lg border border-stone-300 focus:border-red-900 focus:outline-none transition"
            :disabled="loading"
          />
          <button
            @click="sendMessage"
            :disabled="loading || !userInput.trim()"
            class="px-4 py-2 bg-red-900 text-white text-sm rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >发送</button>
        </div>
      </div>
    </Transition>

    <!-- 对话气泡 -->
    <Transition name="bubble-fade">
      <div
        v-if="showBubble && !chatOpen"
        class="relative bg-white rounded-xl shadow-lg px-4 py-2.5 text-sm text-red-900 border border-red-200 max-w-[200px]"
      >
        {{ bubbleText }}
        <!-- 气泡尖角 -->
        <div class="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-red-200 rotate-45"></div>
      </div>
    </Transition>

    <!-- 精灵形象（拖拽手柄 + idle 动画） -->
    <div
      ref="mascotAvatar"
      @mousedown="onDragStart"
      @touchstart.passive="onDragStart"
      class="mascot-idle w-20 h-20 md:w-24 md:h-24 cursor-grab rounded-full select-none"
      :class="{ 'is-dragging': isDragging, 'mascot-wave': isWaving, 'mascot-nod': isNodding }"
      title="点我聊天 · 拖我移动"
    >
      <div class="mascot-blink-wrapper relative">
        <img :src="mascotImg" class="w-full h-full object-contain drop-shadow-lg" draggable="false" />
        <!-- 装扮叠加层 -->
        <div v-if="shopStore.costume.head_css" class="absolute inset-0 pointer-events-none" :class="shopStore.costume.head_css"></div>
        <div v-if="shopStore.costume.body_css" class="absolute inset-0 pointer-events-none" :class="shopStore.costume.body_css"></div>
        <div v-if="shopStore.costume.accessory_css" class="absolute inset-0 pointer-events-none" :class="shopStore.costume.accessory_css"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import mascotImg from '@/assets/mascot.png'
import { useShopStore } from '@/stores/shop'

const shopStore = useShopStore()

const chatOpen = ref(false)
const showBubble = ref(true)
const bubbleText = ref('欢迎来到红脉智联！')
const userInput = ref('')
const loading = ref(false)
const msgBox = ref(null)
const mascotRoot = ref(null)
const mascotAvatar = ref(null)
const messages = ref([
  { role: 'assistant', content: '你好！我是红色文化小助手，有什么想了解的红色历史或文化知识吗？' }
])

const bubbleTexts = [
  '欢迎来到红脉智联！',
  '点我了解红色文化~',
  '有什么想问的吗？',
  '一起传承红色基因！',
]

let bubbleTimer = null

// ========== 模块2：拖拽 ==========
const STORAGE_KEY = 'mascot-position'
const isDragging = ref(false)
// 用 right/bottom 定位（与原始设计一致，从右下角出发）
const posRight = ref(24)
const posBottom = ref(24)
// 拖拽起点记录
let dragStartMouseX = 0
let dragStartMouseY = 0
let dragStartRight = 0
let dragStartBottom = 0
let totalDragDistance = 0

function loadPosition() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const pos = JSON.parse(saved)
      if (typeof pos.right === 'number' && typeof pos.bottom === 'number') {
        // 确保不超出视口
        posRight.value = Math.max(0, Math.min(pos.right, window.innerWidth - 80))
        posBottom.value = Math.max(0, Math.min(pos.bottom, window.innerHeight - 80))
      }
    }
  } catch {}
}

function savePosition() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    right: posRight.value,
    bottom: posBottom.value,
  }))
}

const rootStyle = computed(() => ({
  right: posRight.value + 'px',
  bottom: posBottom.value + 'px',
}))

function onDragStart(e) {
  // 阻止默认行为防止图片拖拽和文本选中
  if (e.type === 'mousedown') e.preventDefault()

  const point = e.touches ? e.touches[0] : e
  dragStartMouseX = point.clientX
  dragStartMouseY = point.clientY
  dragStartRight = posRight.value
  dragStartBottom = posBottom.value
  totalDragDistance = 0
  isDragging.value = true

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('touchend', onDragEnd)
}

function onDragMove(e) {
  e.preventDefault()
  const point = e.touches ? e.touches[0] : e
  const dx = point.clientX - dragStartMouseX
  const dy = point.clientY - dragStartMouseY
  totalDragDistance = Math.abs(dx) + Math.abs(dy)

  // right 方向：鼠标右移(dx>0) → 元素右移 → right 减小
  // bottom 方向：鼠标下移(dy>0) → 元素下移 → bottom 减小
  const newRight = dragStartRight - dx
  const newBottom = dragStartBottom - dy

  posRight.value = Math.max(0, Math.min(window.innerWidth - 80, newRight))
  posBottom.value = Math.max(0, Math.min(window.innerHeight - 80, newBottom))
}

function onDragEnd() {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
  isDragging.value = false

  // 累计移动距离 < 8px 才算点击，否则算拖拽
  if (totalDragDistance < 8) {
    handleClick()
  } else {
    savePosition()
  }
}

// ========== 模块1：idle 动画 ==========
const isWaving = ref(false)
const isNodding = ref(false)
let idleTimer = null

function startIdleAnimations() {
  function scheduleNext() {
    const delay = 6000 + Math.random() * 6000
    idleTimer = setTimeout(() => {
      if (isDragging.value) { scheduleNext(); return }
      if (Math.random() > 0.5) {
        isWaving.value = true
        setTimeout(() => { isWaving.value = false }, 1200)
      } else {
        isNodding.value = true
        setTimeout(() => { isNodding.value = false }, 1000)
      }
      scheduleNext()
    }, delay)
  }
  scheduleNext()
}

onMounted(() => {
  loadPosition()

  // 轮换气泡文字
  let idx = 0
  bubbleTimer = setInterval(() => {
    idx = (idx + 1) % bubbleTexts.length
    showBubble.value = false
    setTimeout(() => {
      bubbleText.value = bubbleTexts[idx]
      showBubble.value = true
    }, 300)
  }, 5000)

  startIdleAnimations()
})

onBeforeUnmount(() => {
  clearInterval(bubbleTimer)
  clearTimeout(idleTimer)
})

function handleClick() {
  chatOpen.value = !chatOpen.value
  if (chatOpen.value) {
    showBubble.value = false
    nextTick(scrollToBottom)
  } else {
    showBubble.value = true
  }
}

function scrollToBottom() {
  if (msgBox.value) {
    msgBox.value.scrollTop = msgBox.value.scrollHeight
  }
}

async function sendMessage() {
  const text = userInput.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  userInput.value = ''
  loading.value = true
  await nextTick(scrollToBottom)

  try {
    const token = localStorage.getItem('token') || ''
    const res = await fetch('/api/doubao.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message: text }),
    })

    if (!res.ok) throw new Error('请求失败')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let assistantMsg = { role: 'assistant', content: '' }
    messages.value.push(assistantMsg)

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const data = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed.slice(5)
        if (data === '[DONE]') break
        if (!data) continue
        try {
          const json = JSON.parse(data)
          if (json.type === 'response.output_text.delta' && json.delta) {
            assistantMsg.content += json.delta
            await nextTick(scrollToBottom)
          } else if (json.choices?.[0]?.delta?.content) {
            assistantMsg.content += json.choices[0].delta.content
            await nextTick(scrollToBottom)
          }
        } catch {}
      }
    }

    if (!assistantMsg.content) {
      assistantMsg.content = '抱歉，我暂时无法回答，请稍后再试。'
    }
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '网络异常，请稍后再试~' })
  } finally {
    loading.value = false
    await nextTick(scrollToBottom)
  }
}
</script>

<style scoped>
/* ========== idle 基础动画：浮动 + 摇摆 ========== */
.mascot-idle {
  animation:
    mascot-breathe 3s ease-in-out infinite,
    mascot-sway 5s ease-in-out infinite;
  transition: transform 0.3s ease;
}
.mascot-idle:hover {
  animation-play-state: paused, paused;
  transform: scale(1.1);
}
.mascot-idle.is-dragging {
  cursor: grabbing !important;
  animation: none !important;
  transform: none !important;
}

/* 上下浮动（保留原有效果） */
@keyframes mascot-breathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* 轻微左右摇摆 */
@keyframes mascot-sway {
  0%, 100% { rotate: 0deg; }
  25% { rotate: 3deg; }
  75% { rotate: -3deg; }
}

/* ========== 眨眼动画 ========== */
.mascot-blink-wrapper {
  animation: mascot-blink 4s ease-in-out infinite;
  width: 100%;
  height: 100%;
}
@keyframes mascot-blink {
  0%, 42%, 46%, 100% { transform: scaleY(1); }
  44% { transform: scaleY(0.92); }
}

/* ========== 挥手动画（随机触发） ========== */
.mascot-wave {
  animation:
    mascot-wave-action 0.4s ease-in-out 3,
    mascot-sway 5s ease-in-out infinite !important;
}
@keyframes mascot-wave-action {
  0%, 100% { rotate: 0deg; }
  25% { rotate: -12deg; }
  75% { rotate: 12deg; }
}

/* ========== 点头动画（随机触发） ========== */
.mascot-nod {
  animation:
    mascot-nod-action 0.5s ease-in-out 2,
    mascot-sway 5s ease-in-out infinite !important;
}
@keyframes mascot-nod-action {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

/* 聊天面板滑入 */
.chat-slide-enter-active, .chat-slide-leave-active {
  transition: all 0.3s ease;
}
.chat-slide-enter-from, .chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 气泡淡入 */
.bubble-fade-enter-active, .bubble-fade-leave-active {
  transition: opacity 0.3s ease;
}
.bubble-fade-enter-from, .bubble-fade-leave-to {
  opacity: 0;
}

/* 遮罩淡入 */
.overlay-fade-enter-active, .overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from, .overlay-fade-leave-to {
  opacity: 0;
}
</style>
