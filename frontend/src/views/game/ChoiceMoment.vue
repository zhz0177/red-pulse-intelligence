<template>
  <div class="max-w-4xl mx-auto px-4 py-8 pb-16">
    <button type="button" @click="handleBack" class="mb-4 text-sm text-stone-500 hover:text-red-900 transition bg-transparent border-0 cursor-pointer">
      ← {{ view === 'list' ? '返回' : '返回列表' }}
    </button>

    <!-- ========== 关卡列表 ========== -->
    <template v-if="view === 'list'">
      <div class="text-center mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-red-900 mb-2">抉择时刻</h1>
        <p class="text-sm text-stone-500">红色知识大闯关 · 走进英烈牺牲前的历史瞬间，做出与史实一致的抉择</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          v-model="listKeyword"
          type="search"
          placeholder="搜索英烈姓名或关卡标题…"
          class="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-900"
        />
        <button
          type="button"
          @click="tabList = 'levels'"
          :class="tabBtnClass(tabList === 'levels')"
        >英烈关卡</button>
        <button
          type="button"
          @click="tabList = 'mine'; loadMy()"
          :class="tabBtnClass(tabList === 'mine')"
        >我的抉择记录</button>
      </div>

      <div v-if="tabList === 'levels'">
        <div v-if="listLoading" class="text-center py-16 text-stone-400">加载关卡中…</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            v-for="item in filteredLevels"
            :key="item.id"
            type="button"
            @click="openLevel(item)"
            class="text-left bg-white rounded-2xl shadow border-2 border-amber-700/15 hover:border-red-900/60 hover:shadow-lg transition p-5 cursor-pointer group"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <span class="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-900 font-medium">{{ item.martyr_name }}</span>
              <span class="text-xs text-stone-400">#{{ item.martyr_id }}</span>
            </div>
            <h3 class="font-bold text-stone-800 group-hover:text-red-900 transition mb-2">{{ item.title }}</h3>
            <p class="text-xs text-stone-500 line-clamp-2 leading-relaxed">{{ item.summary }}</p>
            <div class="mt-3 text-sm text-red-900 font-medium">进入剧情 →</div>
          </button>
        </div>
        <p v-if="!listLoading && !filteredLevels.length" class="text-center py-12 text-stone-400">无匹配关卡</p>
      </div>

      <div v-else>
        <div v-if="myLoading" class="text-center py-16 text-stone-400">加载记录中…</div>
        <div v-else-if="!myRecords.length" class="text-center py-12 text-stone-400">暂无抉择记录，去完成一关吧</div>
        <div v-else class="space-y-3">
          <div
            v-for="r in myRecords"
            :key="r.id"
            class="bg-white rounded-xl border border-stone-200 p-4 text-sm"
          >
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span class="font-medium text-stone-800">{{ r.martyr_name }} · {{ r.story_title }}</span>
              <span :class="r.all_correct ? 'text-green-700 bg-green-50' : 'text-amber-800 bg-amber-50'" class="text-xs px-2 py-0.5 rounded-full">
                {{ r.all_correct ? '与史实一致' : '有待思考' }}
              </span>
            </div>
            <div class="text-xs text-stone-500 mb-1">你的选项：{{ (r.answers || []).join(' → ') }}</div>
            <div v-if="r.reason" class="text-xs text-stone-600 bg-stone-50 rounded-lg p-2 mt-2">思考：{{ r.reason }}</div>
            <div class="text-xs text-stone-400 mt-2">{{ formatTime(r.created_at) }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== 剧情：导语 ========== -->
    <template v-else-if="view === 'intro' && story">
      <div class="rounded-2xl overflow-hidden shadow-xl border-2 border-red-900/20">
        <div class="bg-gradient-to-br from-red-950 via-red-900 to-stone-900 text-white px-6 py-8 md:py-10">
          <p class="text-xs uppercase tracking-widest text-amber-200/80 mb-2">沉浸式剧情 · {{ story.martyr_name }}</p>
          <h2 class="text-xl md:text-2xl font-bold mb-4">{{ story.title }}</h2>
          <p class="text-sm md:text-base leading-relaxed text-stone-100/95 whitespace-pre-wrap">{{ story.intro }}</p>
        </div>
        <div class="bg-stone-50 px-6 py-5 flex flex-col sm:flex-row gap-3 justify-end">
          <button type="button" @click="view = 'list'" class="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-white text-sm cursor-pointer bg-white">先返回</button>
          <div class="flex items-center gap-2">
            <button
              v-if="multiplierCard && !multiplierActive"
              type="button"
              @click="useMultiplierCard"
              class="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-500 cursor-pointer border-0 shadow-lg"
            >
              ✨ 使用翻倍卡
            </button>
            <span v-if="multiplierActive" class="text-xs bg-red-50 text-red-900 border border-red-200 px-3 py-2.5 rounded-xl">
              翻倍已启用
            </span>
            <button type="button" @click="startSteps" class="px-6 py-2.5 rounded-xl bg-red-900 text-white font-bold text-sm hover:bg-red-800 cursor-pointer border-0 shadow-lg">进入抉择时刻</button>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== 多步抉择 ========== -->
    <template v-else-if="view === 'steps' && story && currentStep">
      <div class="mb-4 flex items-center justify-between text-sm text-stone-500">
        <span>{{ story.martyr_name }}</span>
        <span>第 {{ stepIndex + 1 }} / {{ story.steps.length }} 步</span>
      </div>
      <div class="rounded-2xl overflow-hidden shadow-lg border-2 border-amber-700/25 bg-white">
        <div class="bg-gradient-to-r from-amber-900 to-red-900 text-white px-5 py-4">
          <h3 class="font-bold text-lg">{{ currentStep.scene }}</h3>
        </div>
        <div class="p-5 md:p-6">
          <p class="text-stone-700 leading-relaxed mb-6 text-sm md:text-base whitespace-pre-wrap">{{ currentStep.narrative }}</p>
          <div class="space-y-3">
            <button
              v-for="opt in currentStep.options"
              :key="opt.id"
              type="button"
              @click="pick(opt.id)"
              class="w-full text-left px-4 py-4 rounded-xl border-2 transition text-sm md:text-base cursor-pointer"
              :class="answers[stepIndex] === opt.id
                ? 'border-red-900 bg-red-50 text-red-950 font-medium'
                : 'border-stone-200 hover:border-red-300 bg-stone-50/50'"
            >
              <span class="font-bold mr-2">{{ opt.id }}.</span>{{ opt.text }}
            </button>
          </div>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              v-if="stepIndex > 0"
              type="button"
              @click="prevStep"
              class="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm cursor-pointer bg-white"
            >上一步</button>
            <button
              type="button"
              :disabled="!answers[stepIndex] || submitting"
              @click="nextOrSubmit"
              class="px-6 py-2.5 rounded-xl bg-red-900 text-white font-bold text-sm hover:bg-red-800 disabled:opacity-40 cursor-pointer border-0"
            >
              {{ isLastStep ? (submitting ? '提交中…' : '提交抉择') : '下一步' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== 结果（含历史结局） ========== -->
    <template v-else-if="view === 'result' && result">
      <div class="rounded-2xl shadow-xl border-2 overflow-hidden" :class="result.all_correct ? 'border-green-700/30' : 'border-amber-700/30'">
        <div
          class="px-6 py-6 text-white"
          :class="result.all_correct ? 'bg-gradient-to-r from-green-800 to-emerald-900' : 'bg-gradient-to-r from-amber-800 to-red-900'"
        >
          <div class="text-4xl mb-2">{{ result.all_correct ? '✓' : '!' }}</div>
          <h2 class="text-xl font-bold">{{ result.all_correct ? '与历史抉择一致' : '与史实不完全一致' }}</h2>
          <p class="text-sm opacity-90 mt-2">{{ result.all_correct ? '向英烈致敬，铭记真实历史。' : '请阅读下方历史结局，并写下你的思考。' }}</p>
        </div>
        <div class="bg-white p-6 space-y-4">
          <div v-if="!result.all_correct" class="text-sm space-y-2 bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p><span class="text-stone-500">史实选项：</span><strong class="text-green-800">{{ (result.correct_answers || []).join(' → ') }}</strong></p>
            <p><span class="text-stone-500">你的选项：</span><strong class="text-amber-900">{{ (result.your_answers || []).join(' → ') }}</strong></p>
          </div>
          <div class="border-t border-stone-100 pt-4">
            <h3 class="font-bold text-red-900 mb-2">{{ result.ending_title || '历史结局' }}</h3>
            <p class="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{{ result.ending_content }}</p>
          </div>

          <div v-if="!result.all_correct && !resultSaved" class="space-y-2">
            <label class="block text-sm font-medium text-stone-700">请简要填写你的思考或认识（不少于 4 字，将一并保存）</label>
            <textarea
              v-model="reasonDraft"
              rows="3"
              class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-900 resize-none"
              placeholder="例如：我当时顾虑的是……今后我会……"
            />
            <p v-if="reasonError" class="text-sm text-red-600">{{ reasonError }}</p>
            <button
              type="button"
              :disabled="submittingReason || !reasonDraft.trim()"
              @click="submitReason"
              class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-900 text-white text-sm font-bold hover:bg-red-800 disabled:opacity-40 cursor-pointer border-0"
            >提交原因并保存记录</button>
          </div>
          <p v-else-if="!result.all_correct && resultSaved" class="text-sm text-green-700">记录已保存。</p>

          <div class="flex flex-wrap gap-3 pt-2">
            <button type="button" @click="backToList" class="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm cursor-pointer bg-white">返回关卡列表</button>
            <button type="button" @click="replaySame" class="px-5 py-2.5 rounded-xl bg-red-900 text-white text-sm font-bold hover:bg-red-800 cursor-pointer border-0">再玩本关</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getChoiceList, getChoiceStory, submitChoice, getMyChoices } from '../../api/choice'
import { useShopStore } from '../../stores/shop'
import { useGameItem } from '../../api/shop'

const route = useRoute()
const shopStore = useShopStore()

const view = ref('list') // list | intro | steps | result
const tabList = ref('levels')
const listLoading = ref(true)
const levels = ref([])
const listKeyword = ref('')

const story = ref(null)
const stepIndex = ref(0)
const answers = ref([])
const submitting = ref(false)
const rewarded = ref(false)
const multiplierActive = ref(false)

const multiplierCard = computed(() => (
  shopStore.inventory.find(i => i.category === 'game_item' && i.sub_category === 'multiplier' && i.quantity > 0) || null
))

const result = ref(null)
const reasonDraft = ref('')
const reasonError = ref('')
const resultSaved = ref(false)

const myLoading = ref(false)
const myRecords = ref([])

const filteredLevels = computed(() => {
  const k = listKeyword.value.trim().toLowerCase()
  if (!k) return levels.value
  return levels.value.filter(
    (x) =>
      (x.title && x.title.toLowerCase().includes(k)) ||
      (x.martyr_name && x.martyr_name.toLowerCase().includes(k)) ||
      (x.summary && x.summary.toLowerCase().includes(k))
  )
})

const currentStep = computed(() => {
  const s = story.value
  if (!s || !s.steps || !s.steps[stepIndex.value]) return null
  return s.steps[stepIndex.value]
})

const isLastStep = computed(() => {
  const s = story.value
  if (!s || !s.steps) return false
  return stepIndex.value >= s.steps.length - 1
})

function tabBtnClass(active) {
  return [
    'px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition cursor-pointer whitespace-nowrap',
    active ? 'border-red-900 bg-red-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
  ].join(' ')
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t.replace ? t.replace(' ', 'T') : t)
  if (Number.isNaN(d.getTime())) return t
  return d.toLocaleString('zh-CN', { hour12: false })
}

async function loadList() {
  listLoading.value = true
  try {
    const res = await getChoiceList()
    levels.value = res.data || []
  } catch (e) {
    console.error(e)
    levels.value = []
  } finally {
    listLoading.value = false
  }
}

async function loadMy() {
  myLoading.value = true
  try {
    const res = await getMyChoices()
    myRecords.value = res.data || []
  } catch (e) {
    console.error(e)
    myRecords.value = []
  } finally {
    myLoading.value = false
  }
}

function openLevel(item) {
  loadStoryById(item.id)
}

async function loadStoryById(id) {
  story.value = null
  try {
    const res = await getChoiceStory({ id })
    story.value = res.data
    view.value = 'intro'
    stepIndex.value = 0
    answers.value = []
    rewarded.value = false
    multiplierActive.value = false
  } catch (e) {
    alert(e.message || '加载剧情失败')
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

function startSteps() {
  stepIndex.value = 0
  answers.value = story.value.steps.map(() => null)
  view.value = 'steps'
  rewarded.value = false
}

function pick(id) {
  const next = [...answers.value]
  next[stepIndex.value] = id
  answers.value = next
}

function prevStep() {
  if (stepIndex.value > 0) stepIndex.value--
}

async function nextOrSubmit() {
  if (!answers.value[stepIndex.value]) return
  if (!isLastStep.value) {
    stepIndex.value++
    return
  }
  await doSubmit()
}

async function doSubmit() {
  submitting.value = true
  reasonError.value = ''
  try {
    const payload = {
      story_id: story.value.id,
      answers: answers.value.map((x) => String(x).toUpperCase()),
    }
    if (reasonDraft.value.trim()) {
      payload.reason = reasonDraft.value.trim()
    }
    const res = await submitChoice(payload)
    result.value = res.data
    resultSaved.value = true
    reasonDraft.value = ''
    view.value = 'result'
    if (!rewarded.value) {
      const reason = multiplierActive.value ? 'choice_game_double' : 'choice_game'
      try { await shopStore.earn(reason) } catch {}
      rewarded.value = true
    }
  } catch (e) {
    const d = e.data
    if (d?.need_reason) {
      result.value = {
        all_correct: false,
        correct_answers: d.correct_answers,
        your_answers: d.your_answers,
        ending_title: d.ending_title,
        ending_content: d.ending_content,
      }
      resultSaved.value = false
      reasonDraft.value = ''
      view.value = 'result'
    } else {
      alert(e.message || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}

async function submitReason() {
  if (!reasonDraft.value.trim() || reasonDraft.value.trim().length < 4) {
    reasonError.value = '请至少输入 4 个字'
    return
  }
  submitting.value = true
  reasonError.value = ''
  try {
    const res = await submitChoice({
      story_id: story.value.id,
      answers: answers.value.map((x) => String(x).toUpperCase()),
      reason: reasonDraft.value.trim(),
    })
    result.value = res.data
    resultSaved.value = true
    reasonDraft.value = ''
    if (!rewarded.value) {
      const reason = multiplierActive.value ? 'choice_game_double' : 'choice_game'
      try { await shopStore.earn(reason) } catch {}
      rewarded.value = true
    }
  } catch (e) {
    reasonError.value = e.message || '提交失败'
  } finally {
    submitting.value = false
  }
}

function backToList() {
  view.value = 'list'
  tabList.value = 'levels'
  story.value = null
  result.value = null
  reasonDraft.value = ''
  resultSaved.value = false
  multiplierActive.value = false
  loadList()
}

function replaySame() {
  result.value = null
  resultSaved.value = false
  reasonDraft.value = ''
  stepIndex.value = 0
  answers.value = story.value.steps.map(() => null)
  view.value = 'steps'
  rewarded.value = false
  multiplierActive.value = false
}

function handleBack() {
  if (view.value === 'list') {
    window.history.length > 1 ? window.history.back() : (window.location.href = '/game')
    return
  }
  if (view.value === 'steps' || view.value === 'intro') {
    view.value = 'list'
    story.value = null
    return
  }
  if (view.value === 'result') {
    backToList()
  }
}

onMounted(async () => {
  await loadList()
  const qid = route.query.id
  const qmid = route.query.martyr_id
  if (qid) {
    await loadStoryById(Number(qid))
  } else if (qmid) {
    try {
      const res = await getChoiceStory({ martyr_id: Number(qmid) })
      story.value = res.data
      view.value = 'intro'
      stepIndex.value = 0
      answers.value = []
    } catch (e) {
      console.warn(e)
    }
  }
})
</script>
