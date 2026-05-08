<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <button @click="handleBack" class="mb-4 text-sm text-stone-500 hover:text-red-900 transition bg-transparent border-0 cursor-pointer">
      ← 返回
    </button>

    <!-- 游戏未开始 -->
    <div v-if="state === 'idle'" class="text-center py-12">
      <div class="bg-white rounded-2xl shadow-lg border-2 border-amber-700/20 p-8 max-w-md mx-auto">
        <div class="text-6xl mb-4">⚡</div>
        <h1 class="text-2xl font-bold text-red-900 mb-3">英烈知识百题斩</h1>
        <p class="text-sm text-stone-500 mb-6 leading-relaxed">
          从题库随机抽取选择题，答对继续前进，答错即刻终止。<br/>看看你能连续答对多少题！
        </p>
        <button @click="startGame" class="px-8 py-3 bg-red-900 text-white rounded-xl font-bold text-lg hover:bg-red-800 transition border-0 cursor-pointer shadow-lg">
          开始挑战
        </button>

        <!-- 排行榜入口 -->
        <button @click="showLeaderboard = true" class="mt-4 block mx-auto text-sm text-red-900 hover:text-red-700 transition bg-transparent border-0 cursor-pointer">
          查看排行榜 →
        </button>
      </div>
    </div>

    <!-- 答题中 -->
    <div v-if="state === 'playing' && currentQuestion" class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-red-900 text-white rounded-full text-sm font-bold">
            第 {{ streak + 1 }} 题
          </span>
          <span v-if="currentQuestion.category" class="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full">
            {{ currentQuestion.category }}
          </span>
        </div>
        <div class="text-sm text-stone-500">
          已连对 <strong class="text-red-900 text-lg">{{ streak }}</strong> 题
        </div>
      </div>

      <!-- 道具面板 -->
      <div class="flex flex-wrap items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
        <span class="text-xs text-stone-500 mr-1">道具：</span>

        <button
          type="button"
          @click="useHintCard"
          :disabled="answering || !hintCard || !!hintCorrect"
          :class="[
            'px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer',
            'border-stone-200 bg-white text-stone-700 hover:border-red-900 hover:text-red-900',
            (!hintCard || answering || !!hintCorrect) ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          💡 题目答案提示卡
        </button>

        <button
          type="button"
          @click="useShieldCard"
          :disabled="answering || !shieldCard || shieldActive"
          :class="[
            'px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer',
            'border-stone-200 bg-white text-stone-700 hover:border-red-900 hover:text-red-900',
            (!shieldCard || answering || shieldActive) ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          🛡️ 错题免错卡
        </button>

        <button
          type="button"
          @click="useMultiplierCard"
          :disabled="answering || !multiplierCard || multiplierActive"
          :class="[
            'px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer',
            'border-stone-200 bg-white text-stone-700 hover:border-red-900 hover:text-red-900',
            (!multiplierCard || answering || multiplierActive) ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          ✨ 游戏翻倍卡
        </button>

        <span v-if="multiplierActive" class="text-xs bg-red-50 text-red-900 border border-red-200 px-2 py-1 rounded-full ml-auto">
          翻倍已启用
        </span>
      </div>

      <!-- 题目卡片 -->
      <div class="bg-white rounded-2xl shadow-lg border-2 border-amber-700/20 overflow-hidden">
        <div class="bg-gradient-to-r from-red-900 to-red-800 text-white p-5">
          <p class="text-base leading-relaxed font-medium">{{ currentQuestion.question }}</p>
        </div>
        <div class="p-5 space-y-3">
          <button
            v-for="opt in options"
            :key="opt.key"
            @click="selectAnswer(opt.key)"
            :disabled="answering"
            class="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-sm"
            :class="getOptionClass(opt.key)"
          >
            <span class="font-bold mr-3 text-base">{{ opt.key }}.</span>
            <span>{{ opt.text }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="state === 'playing' && !currentQuestion" class="text-center py-20">
      <div class="animate-pulse text-stone-400">正在加载题目...</div>
    </div>

    <!-- 游戏结束 -->
    <div v-if="state === 'over'" class="text-center py-12">
      <div class="bg-white rounded-2xl shadow-lg border-2 border-amber-700/20 p-8 max-w-md mx-auto">
        <div class="text-6xl mb-4">{{ streak >= 10 ? '🎉' : streak >= 5 ? '👏' : '💪' }}</div>
        <h2 class="text-2xl font-bold text-red-900 mb-2">挑战结束</h2>
        <p class="text-stone-500 mb-4">
          {{ lastWrong ? '很遗憾，答错了！' : '题库已全部答完，太厉害了！' }}
        </p>
        <div class="bg-red-50 rounded-xl p-4 mb-6">
          <div class="text-3xl font-bold text-red-900">{{ streak }}</div>
          <div class="text-sm text-stone-500">连续答对题数</div>
        </div>
        <div v-if="lastWrong" class="bg-stone-50 rounded-xl p-4 mb-6 text-left">
          <p class="text-xs text-stone-400 mb-1">最后一题：</p>
          <p class="text-sm text-stone-700 mb-2">{{ lastWrong.question }}</p>
          <p class="text-sm">
            <span class="text-red-600">你的答案：{{ lastWrong.userAnswer }}</span>
            <span class="mx-2 text-stone-300">|</span>
            <span class="text-green-700">正确答案：{{ lastWrong.correctAnswer }}</span>
          </p>
        </div>
        <div class="flex gap-3 justify-center">
          <button @click="startGame" class="px-6 py-3 bg-red-900 text-white rounded-xl font-bold hover:bg-red-800 transition border-0 cursor-pointer">
            再来一局
          </button>
          <button @click="showLeaderboard = true" class="px-6 py-3 bg-white text-red-900 rounded-xl font-bold border-2 border-red-900 hover:bg-red-50 transition cursor-pointer">
            排行榜
          </button>
        </div>
      </div>
    </div>

    <!-- 排行榜弹窗 -->
    <div v-if="showLeaderboard" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showLeaderboard = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div class="bg-gradient-to-r from-red-900 to-red-800 text-white p-5 flex items-center justify-between flex-shrink-0">
          <h3 class="text-lg font-bold">🏆 排行榜</h3>
          <button @click="showLeaderboard = false" class="text-white/80 hover:text-white bg-transparent border-0 text-xl cursor-pointer">×</button>
        </div>
        <div class="overflow-y-auto flex-1 p-4">
          <div v-if="leaderboardLoading" class="text-center py-8 text-stone-400">加载中...</div>
          <div v-else-if="!leaderboard.length" class="text-center py-8 text-stone-400">暂无记录</div>
          <div v-else class="space-y-2">
            <div
              v-for="(item, idx) in leaderboard"
              :key="idx"
              class="flex items-center gap-3 px-4 py-3 rounded-xl transition"
              :class="idx < 3 ? 'bg-red-50' : 'bg-stone-50'"
            >
              <div class="w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0"
                :class="idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-stone-300 text-white' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'"
              >
                {{ idx + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-stone-800 truncate">{{ item.username }}</div>
                <div class="text-xs text-stone-400">{{ formatTime(item.created_at) }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-lg font-bold text-red-900">{{ item.streak }}</div>
                <div class="text-xs text-stone-400">连对</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getQuestion, submitAnswer, submitScore, getLeaderboard } from '../../api/quiz'
import { useShopStore } from '../../stores/shop'
import { useGameItem } from '../../api/shop'

const router = useRouter()
const shopStore = useShopStore()

const state = ref('idle') // idle | playing | over
const streak = ref(0)
const answeredIds = ref([])
const currentQuestion = ref(null)
const selectedAnswer = ref(null)
const answerResult = ref(null) // null | 'correct' | 'wrong'
const answering = ref(false)
const lastWrong = ref(null)
const startTime = ref(0)

// 道具使用状态（本局内）
const hintCorrect = ref(null) // 提示卡揭示的正确选项 A/B/C/D
const shieldActive = ref(false) // 错题免错卡已启用
const multiplierActive = ref(false) // 游戏翻倍卡已启用

const showLeaderboard = ref(false)
const leaderboard = ref([])
const leaderboardLoading = ref(false)

const options = computed(() => {
  const q = currentQuestion.value
  if (!q) return []
  return [
    { key: 'A', text: q.option_a },
    { key: 'B', text: q.option_b },
    { key: 'C', text: q.option_c },
    { key: 'D', text: q.option_d },
  ]
})

const hintCard = computed(() => shopStore.inventory.find(i => i.category === 'game_item' && i.sub_category === 'hint' && i.quantity > 0) || null)
const shieldCard = computed(() => shopStore.inventory.find(i => i.category === 'game_item' && i.sub_category === 'shield' && i.quantity > 0) || null)
const multiplierCard = computed(() => shopStore.inventory.find(i => i.category === 'game_item' && i.sub_category === 'multiplier' && i.quantity > 0) || null)

function getOptionClass(key) {
  if (!selectedAnswer.value) {
    if (hintCorrect.value) {
      if (key === hintCorrect.value) return 'bg-emerald-50 border-emerald-500 text-emerald-800 font-medium'
      return 'bg-white border-stone-200 opacity-50'
    }
    return 'bg-white border-stone-200 hover:border-red-900 hover:bg-red-50'
  }
  if (answerResult.value === 'correct' && key === selectedAnswer.value) {
    return 'bg-green-50 border-green-500 text-green-800'
  }
  if (answerResult.value === 'wrong') {
    if (key === selectedAnswer.value) return 'bg-red-50 border-red-500 text-red-800'
    if (key === currentQuestion.value._correctAnswer) return 'bg-green-50 border-green-500 text-green-800'
  }
  return 'bg-white border-stone-200 opacity-50'
}

async function startGame() {
  state.value = 'playing'
  streak.value = 0
  answeredIds.value = []
  currentQuestion.value = null
  lastWrong.value = null
  startTime.value = Date.now()
  hintCorrect.value = null
  shieldActive.value = false
  multiplierActive.value = false
  await fetchNext()
}

async function fetchNext() {
  currentQuestion.value = null
  selectedAnswer.value = null
  answerResult.value = null
  hintCorrect.value = null
  try {
    const res = await getQuestion(answeredIds.value.join(','))
    currentQuestion.value = res.data
  } catch (err) {
    // 题库答完
    await endGame(false)
  }
}

// ========== 传承豆道具使用 ==========
async function useHintCard() {
  if (!hintCard.value || !currentQuestion.value || hintCorrect.value) return
  try {
    // 消耗提示卡并刷新背包
    await useGameItem({ item_id: hintCard.value.item_id })
    await shopStore.fetchInventory()

    // 查看答案：后端返回 correct_answer，可直接揭示
    const res = await submitAnswer({
      question_id: currentQuestion.value.id,
      answer: 'A',
    })
    hintCorrect.value = res.data.correct_answer
  } catch (e) {
    alert(e.message || '使用提示卡失败')
  }
}

async function useShieldCard() {
  if (!shieldCard.value || shieldActive.value) return
  try {
    await useGameItem({ item_id: shieldCard.value.item_id })
    await shopStore.fetchInventory()
    shieldActive.value = true
  } catch (e) {
    alert(e.message || '使用免错卡失败')
  }
}

async function useMultiplierCard() {
  if (!multiplierCard.value || multiplierActive.value) return
  try {
    await useGameItem({ item_id: multiplierCard.value.item_id })
    await shopStore.fetchInventory()
    multiplierActive.value = true
  } catch (e) {
    alert(e.message || '使用翻倍卡失败')
  }
}

async function selectAnswer(key) {
  if (answering.value || selectedAnswer.value) return
  answering.value = true
  selectedAnswer.value = key

  try {
    const res = await submitAnswer({
      question_id: currentQuestion.value.id,
      answer: key
    })
    const correct = res.data.correct
    currentQuestion.value._correctAnswer = res.data.correct_answer
    answerResult.value = correct ? 'correct' : 'wrong'

    answeredIds.value.push(currentQuestion.value.id)

    if (correct) {
      streak.value++
      // 百题斩 → 每答对 1 题：+2 传承豆
      const reason = multiplierActive.value ? 'quiz_correct_double' : 'quiz_correct'
      try { await shopStore.earn(reason) } catch {}
      setTimeout(() => {
        answering.value = false
        fetchNext()
      }, 800)
    } else {
      lastWrong.value = {
        question: currentQuestion.value.question,
        userAnswer: key,
        correctAnswer: res.data.correct_answer
      }
      if (shieldActive.value) {
        // 错题免错：消费后继续游戏（连对清零）
        shieldActive.value = false
        streak.value = 0
        lastWrong.value = null
        setTimeout(() => {
          answering.value = false
          fetchNext()
        }, 1200)
      } else {
        setTimeout(() => {
          answering.value = false
          endGame(true)
        }, 1500)
      }
    }
  } catch {
    answering.value = false
  }
}

async function endGame(wasWrong) {
  const totalTime = Math.round((Date.now() - startTime.value) / 1000)
  state.value = 'over'
  if (!wasWrong) lastWrong.value = null
  try {
    await submitScore({ streak: streak.value, total_time: totalTime })
  } catch { /* ignore */ }
}

function handleBack() {
  if (state.value === 'playing') {
    state.value = 'idle'
  } else {
    router.back()
  }
}

function formatTime(dt) {
  if (!dt) return ''
  return dt.replace('T', ' ').substring(0, 16)
}

watch(showLeaderboard, async (v) => {
  if (v) {
    leaderboardLoading.value = true
    try {
      const res = await getLeaderboard()
      leaderboard.value = res.data || []
    } catch { leaderboard.value = [] }
    leaderboardLoading.value = false
  }
})
</script>
