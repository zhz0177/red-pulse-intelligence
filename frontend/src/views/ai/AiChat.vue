<template>
  <div class="flex flex-col" style="height: calc(100vh - 64px)">
    <!-- 顶部标题 -->
    <div class="text-center py-3 border-b border-stone-200 bg-white/80">
      <h2 class="text-lg font-bold text-red-900 flex items-center justify-center gap-2">
        <span>🤖</span> AI 助手
      </h2>
      <p class="text-xs text-stone-400 mt-0.5">红色文化解读 · 智能问答</p>
    </div>

    <!-- 聊天消息区域 -->
    <div ref="chatBox" class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <!-- 欢迎页 -->
      <div v-if="!messages.length" class="flex flex-col items-center justify-center h-full text-center">
        <div class="text-5xl mb-4">🏛</div>
        <h3 class="text-lg font-bold text-red-900 mb-2">你好，我是红脉智联 AI 助手</h3>
        <p class="text-sm text-stone-500 mb-6 max-w-md">
          我可以为你解读红色文化、讲述革命故事、分析烈士家书，也可以回答你的各种问题。
        </p>
        <div class="flex flex-wrap justify-center gap-2 max-w-lg">
          <button
            v-for="q in quickQuestions" :key="q"
            @click="sendQuick(q)"
            class="text-xs px-3 py-2 bg-white border border-amber-700/30 text-stone-700 rounded-full hover:bg-red-50 hover:border-red-900 hover:text-red-900 transition cursor-pointer"
          >{{ q }}</button>
        </div>
      </div>

      <!-- 消息列表 -->
      <template v-for="(msg, i) in messages" :key="i">
        <!-- 用户消息 -->
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div class="max-w-[80%] bg-red-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
            {{ msg.content }}
          </div>
        </div>
        <!-- AI 消息 -->
        <div v-else class="flex justify-start gap-2">
          <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm flex-shrink-0 mt-1">🤖</div>
          <div class="max-w-[80%] bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-stone-800 shadow-sm whitespace-pre-wrap">{{ msg.content }}<span v-if="i === messages.length - 1 && loading" class="inline-block w-1.5 h-4 bg-red-900 ml-0.5 animate-pulse align-middle"></span>
          </div>
        </div>
      </template>
    </div>

    <!-- 底部输入区域 -->
    <div class="border-t border-stone-200 bg-white px-4 py-3">
      <div class="max-w-3xl mx-auto flex gap-2">
        <input
          v-model="inputText"
          @keydown.enter.prevent="send"
          :disabled="loading"
          type="text"
          class="flex-1 px-4 py-2.5 border border-stone-300 rounded-full focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900 text-sm disabled:bg-stone-100"
          placeholder="输入你的问题..."
        />
        <button
          @click="send"
          :disabled="loading || !inputText.trim()"
          class="bg-red-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-800 transition disabled:opacity-50 border-0 cursor-pointer flex-shrink-0"
        >
          {{ loading ? '回答中' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { chatStream } from '../../api/ai'

const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const chatBox = ref(null)

const quickQuestions = [
  '讲讲赵一曼的革命故事',
  '解读一封红色家书',
  '什么是红色文化精神？',
  '有哪些著名的革命烈士？',
  '长征精神的核心是什么？',
]

function scrollToBottom() {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
  })
}

function sendQuick(q) {
  inputText.value = q
  send()
}

async function send() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: text })
  messages.value.push({ role: 'assistant', content: '' })
  loading.value = true
  scrollToBottom()

  // 只发最近 20 条消息作为上下文
  const history = messages.value
    .slice(0, -1)
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content }))

  try {
    await chatStream(history, (chunk) => {
      messages.value[messages.value.length - 1].content += chunk
      scrollToBottom()
    })
  } catch (e) {
    messages.value[messages.value.length - 1].content = '抱歉，请求失败：' + (e.message || '未知错误')
  }

  loading.value = false
  scrollToBottom()
}
</script>
