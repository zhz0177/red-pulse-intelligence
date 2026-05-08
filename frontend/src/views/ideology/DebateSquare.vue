<template>
  <div class="debate-pk space-y-5">
    <!-- 页头 -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h2 class="text-xl font-bold text-red-900 mb-1">思政辩论小广场</h2>
        <p class="text-sm text-stone-500">不追求输赢，重在正向思辨与理性表达。单场 3-7 天周期（本地模拟）。</p>
      </div>
    </div>

    <!-- 多议题：横向 Swiper（手势/触控滑动切换） -->
    <div v-if="issues.length === 0" class="text-sm text-stone-500 py-8 text-center rounded-2xl border border-stone-200 bg-stone-50">
      暂无议题
    </div>
    <div v-else class="issue-swiper-wrap rounded-2xl border border-red-900/10 bg-gradient-to-br from-red-50/80 to-stone-50 p-3 shadow-md">
      <Swiper
        :modules="swiperModules"
        :slides-per-view="1.15"
        :space-between="12"
        :breakpoints="{ 640: { slidesPerView: 1.4 }, 768: { slidesPerView: 2.1 }, 1024: { slidesPerView: 2.6 } }"
        :pagination="{ clickable: true, dynamicBullets: true }"
        :grab-cursor="true"
        :mousewheel="{ forceToAxis: true, sensitivity: 1 }"
        class="issue-swiper pb-8"
        @swiper="onSwiperReady"
        @slide-change="onSlideChange"
      >
        <SwiperSlide v-for="i in issues" :key="i.id">
          <button
            type="button"
            @click="selectIssue(i.id)"
            :class="[
              'ideology-card w-full text-left rounded-2xl border p-4 h-full min-h-[120px] transition-all duration-300',
              selectedIssueId === i.id
                ? 'border-red-800 bg-white shadow-lg ring-2 ring-red-900/20 scale-[1.02]'
                : 'border-stone-200/80 bg-white/90 hover:-translate-y-1 hover:shadow-lg',
              i.status === 'closed' ? 'opacity-75 grayscale-[0.35]' : '',
            ]"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="text-xs text-stone-500">{{ i.category }}</div>
                <div class="font-bold text-stone-900 line-clamp-2 mt-0.5">{{ i.title }}</div>
              </div>
              <span
                v-if="i.status === 'published'"
                class="shrink-0 text-xs rounded-full px-2.5 py-0.5 font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 badge-breathe"
              >
                进行中
              </span>
              <span v-else class="shrink-0 text-xs rounded-full px-2.5 py-0.5 border bg-stone-100 text-stone-500 border-stone-200">
                已结束
              </span>
            </div>
            <div class="text-xs text-stone-400 mt-2">{{ timeLabel(i) }}</div>
          </button>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- PK 主区 + 详情（选中议题） -->
    <div v-if="selectedIssue" class="space-y-4">
      <!-- PK 对战：左正方 / 中论题+PK+“投票”条 / 右反方（正方蓝、反方红；条为双方已通过发言占比） -->
      <div
        class="ideology-card rounded-2xl border border-red-900/15 bg-white p-4 md:p-6 shadow-lg"
      >
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,1.4fr)_1fr] gap-4 items-stretch">
          <!-- 正方（蓝） -->
          <div
            class="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 flex flex-col justify-center text-center shadow-sm hover:-translate-y-0.5 transition-transform duration-300"
          >
            <div class="text-xs font-bold text-blue-800 uppercase tracking-wider">正方</div>
            <div class="text-3xl font-black text-blue-700 mt-1 tabular-nums">{{ pkCounts.positive }}</div>
            <div class="text-xs text-blue-600/90 mt-1">已通过发言</div>
            <div class="text-[11px] text-stone-500 mt-2 leading-snug">理性立论 · 正向价值</div>
          </div>

          <!-- 中间：论题 + PK + 进度条 -->
          <div class="flex flex-col justify-center gap-3 min-w-0">
            <div class="text-center">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900 text-white text-xs font-bold shadow-md">
                <span class="pk-vs">PK</span>
              </div>
              <h3 class="text-lg md:text-xl font-bold text-red-950 mt-3 leading-snug px-1">
                {{ selectedIssue.title }}
              </h3>
              <div class="text-xs text-stone-500 mt-1">{{ selectedIssue.category }} · 累计参与 <strong class="text-red-900">{{ speechStats.approvedCount }}</strong> 条</div>
            </div>

            <!-- 双阵营“投票”可视化：以双方已通过发言数为权重（非独立投票接口，保留业务真实数据） -->
            <div class="px-1">
              <div class="flex justify-between text-xs font-bold mb-1">
                <span class="text-blue-700">{{ positivePct }}% 正方</span>
                <span class="text-red-700">{{ negativePct }}% 反方</span>
              </div>
              <div
                class="h-4 rounded-full overflow-hidden bg-stone-200 flex w-full shadow-inner"
                role="img"
                :aria-label="`正方占比 ${positivePct}%，反方占比 ${negativePct}%`"
              >
                <div
                  class="h-full bg-gradient-to-r from-blue-500 to-blue-600 vote-bar-fill vote-bar-blue transition-[width] duration-700 ease-out min-w-0"
                  :style="{ width: `${positivePct}%` }"
                />
                <div
                  class="h-full bg-gradient-to-l from-red-600 to-red-500 vote-bar-fill vote-bar-red transition-[width] duration-700 ease-out min-w-0"
                  :style="{ width: `${negativePct}%` }"
                />
              </div>
              <div class="text-[10px] text-stone-400 mt-1 text-center">展示为双方已通过审核发言的分布，可滑动上方卡片切换议题</div>
            </div>
          </div>

          <!-- 反方（红） -->
          <div
            class="rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-white p-4 flex flex-col justify-center text-center shadow-sm hover:-translate-y-0.5 transition-transform duration-300"
          >
            <div class="text-xs font-bold text-red-800 uppercase tracking-wider">反方</div>
            <div class="text-3xl font-black text-red-700 mt-1 tabular-nums">{{ pkCounts.negative }}</div>
            <div class="text-xs text-red-700/90 mt-1">已通过发言</div>
            <div class="text-[11px] text-stone-500 mt-2 leading-snug">思辨质疑 · 建设性反驳</div>
          </div>
        </div>
      </div>

      <!-- 红色素材彩蛋 -->
      <div class="ideology-card rounded-2xl border border-stone-200 bg-stone-50/80 p-4 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
        <div class="text-xs text-amber-800 font-bold mb-2">红色文化素材彩蛋</div>
        <div class="font-bold text-stone-900">{{ material.martyr }}</div>
        <div class="text-sm text-stone-700 mt-1">{{ material.spirit }}</div>
        <div class="text-xs text-stone-500 mt-2 whitespace-pre-wrap leading-relaxed">{{ material.egg }}</div>
      </div>

      <!-- 提交区 -->
      <div v-if="selectedIssue.status === 'published'" class="ideology-card rounded-2xl border border-amber-700/20 bg-white p-4 shadow-md">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <div class="text-xs bg-red-50 text-red-900 border border-red-100 rounded-full px-3 py-1">限发言 1-2 次（200-500 字/次）</div>
          <div class="text-xs text-stone-500">你已提交：<strong class="text-red-900">{{ mySpeechCount }}</strong> 次</div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <button
            type="button"
            @click="side = 'positive'"
            :class="[
              'px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-300 btn-press',
              side === 'positive' ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md scale-[1.02]' : 'border-stone-200 hover:border-blue-400/60 bg-white hover:-translate-y-0.5',
            ]"
          >
            正方
          </button>
          <button
            type="button"
            @click="side = 'negative'"
            :class="[
              'px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-300 btn-press',
              side === 'negative' ? 'border-red-700 bg-red-50 text-red-900 shadow-md scale-[1.02]' : 'border-stone-200 hover:border-red-400/60 bg-white hover:-translate-y-0.5',
            ]"
          >
            反方
          </button>
        </div>

        <textarea
          v-model="speechDraft"
          rows="5"
          class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-900/25 focus:border-red-900"
          placeholder="请围绕正向思辨表达你的立论、依据与行动建议…"
        />
        <div class="flex items-center justify-between mt-2 flex-wrap gap-2">
          <div class="text-xs text-stone-500">
            字数：<strong class="text-stone-800">{{ lenCN(speechDraft) }}</strong> / 200-500
          </div>
          <button
            type="button"
            @click="submitSpeech"
            :disabled="submitLoading"
            class="submit-glow px-5 py-2.5 rounded-xl bg-red-900 text-white text-sm font-bold border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="submitLoading" class="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
            {{ submitLoading ? '提交中…' : '提交发言' }}
          </button>
        </div>
        <div v-if="submitError" class="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {{ submitError }}
        </div>
      </div>

      <div v-else class="ideology-card rounded-2xl border border-stone-200 bg-stone-50 p-4 shadow-md">
        <div class="text-xs text-amber-800 font-bold mb-2">专家顾问点评（思政总结）</div>
        <div class="text-sm font-bold text-stone-900">{{ selectedIssue.teacher.expertName || '专家顾问' }}</div>
        <div class="text-sm text-stone-700 mt-2 whitespace-pre-wrap leading-relaxed">
          {{ selectedIssue.teacher.summary || '（管理员尚未填写总结点评）' }}
        </div>
        <div class="text-xs text-stone-500 mt-2 whitespace-pre-wrap leading-relaxed">
          {{ selectedIssue.teacher.remark || '' }}
        </div>
      </div>

      <!-- 历史发言：可折叠，默认收起 -->
      <div class="ideology-card rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-md">
        <button
          type="button"
          @click="historyOpen = !historyOpen"
          class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-gradient-to-r from-red-900/5 to-transparent hover:from-red-900/10 transition-colors"
        >
          <div>
            <span class="font-bold text-stone-900">历史发言区</span>
            <span class="text-xs text-stone-500 ml-2">（已通过审核）</span>
          </div>
          <span class="text-stone-400 text-sm transition-transform duration-300" :class="historyOpen ? 'rotate-180' : ''">▼</span>
        </button>
        <div v-show="historyOpen" class="px-4 pb-4 pt-0 border-t border-stone-100 animate-fade-in">
          <div class="flex items-center justify-between py-3">
            <h4 class="font-bold text-stone-900 text-sm">辩论线程</h4>
            <div class="text-xs text-stone-500">只展示“已通过审核”的发言</div>
          </div>
          <div v-if="approvedSpeeches.length === 0" class="text-sm text-stone-500 py-6 text-center">
            暂无通过发言
          </div>
          <div v-else class="space-y-3 max-h-[min(70vh,520px)] overflow-y-auto pr-1">
            <div
              v-for="s in approvedSpeeches"
              :key="s.id"
              class="ideology-card bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="min-w-0">
                  <div class="text-xs text-stone-500">侧：{{ s.side === 'positive' ? '正方' : '反方' }} · {{ timeAgo(s.createdAt) }}</div>
                  <div class="text-sm font-bold text-red-900 mt-1 truncate">{{ s.username || '匿名' }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="likeSpeech(s.id)"
                    class="text-xs px-3 py-1.5 rounded-xl border border-stone-200 hover:border-red-900/60 hover:text-red-900 transition-all cursor-pointer bg-white btn-press hover:-translate-y-0.5"
                  >
                    👍 赞 {{ s.likes }}
                  </button>
                  <button
                    type="button"
                    @click="favSpeech(s.id)"
                    class="text-xs px-3 py-1.5 rounded-xl border border-stone-200 hover:border-red-900/60 hover:text-red-900 transition-all cursor-pointer bg-white btn-press hover:-translate-y-0.5"
                  >
                    {{ isFav(s.id) ? '★ 已收藏' : '☆ 收藏' }}
                  </button>
                </div>
              </div>
              <div class="text-sm text-stone-700 mt-3 whitespace-pre-wrap leading-relaxed">
                {{ s.content }}
              </div>

              <div class="mt-3 pt-3 border-t border-stone-100">
                <div class="text-xs text-stone-500 mb-2">互评（评论）</div>
                <div class="flex gap-2 flex-wrap">
                  <input
                    v-model="speechCommentDrafts[s.id]"
                    type="text"
                    maxlength="250"
                    class="flex-1 min-w-[160px] text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-900"
                    placeholder="写下你的互评…（20-250字）"
                  />
                  <button
                    type="button"
                    @click="submitSpeechComment(s.id)"
                    class="px-4 py-2 rounded-xl bg-red-900 text-white text-sm font-bold hover:bg-red-800 transition-all btn-press shrink-0"
                  >
                    发送
                  </button>
                </div>

                <div v-if="speechCommentDraftsErr[s.id]" class="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-2">
                  {{ speechCommentDraftsErr[s.id] }}
                </div>

                <div v-if="commentsBySpeech(s.id).length" class="mt-3 space-y-2">
                  <div
                    v-for="c in commentsBySpeech(s.id)"
                    :key="c.id"
                    class="bg-stone-50 border border-stone-200 rounded-xl p-3"
                  >
                    <div class="text-xs text-stone-500">
                      {{ c.username || '匿名' }} · {{ timeAgo(c.createdAt) }}
                      <span v-if="c.awarded" class="ml-2 text-green-700 font-bold">+2</span>
                    </div>
                    <div class="text-sm text-stone-700 mt-1 whitespace-pre-wrap">{{ c.content }}</div>
                  </div>
                </div>
                <div v-else class="text-xs text-stone-400 mt-3">暂无评论</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedIssue.status === 'closed'" class="ideology-card rounded-2xl bg-amber-50/50 border border-amber-700/20 p-4 shadow-md">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div class="text-sm font-bold text-amber-900">完成思政小结（+10）</div>
            <div class="text-xs text-amber-800/80">结合专家总结，写下你的反思与下一步行动（120-600字）</div>
          </div>
          <div class="text-xs text-stone-600">你可以完成一次</div>
        </div>
        <textarea
          v-model="issueSummaryDraft"
          rows="4"
          class="mt-3 w-full border border-amber-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-red-900"
          placeholder="例如：我从XX素材中理解到……接下来我会把行动落实到……"
        />
        <div class="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            :disabled="summaryLoading"
            @click="submitIssueSummary"
            class="submit-glow px-4 py-2 rounded-xl bg-red-900 text-white text-sm font-bold hover:bg-red-800 transition border-0 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="summaryLoading" class="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ summaryLoading ? '提交中…' : '提交思政小结' }}
          </button>
        </div>
        <div v-if="summaryError" class="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {{ summaryError }}
        </div>
      </div>
    </div>

    <div v-else-if="issues.length" class="text-center py-16 text-stone-400 rounded-2xl border border-dashed border-stone-200">
      请滑动上方卡片选择一个议题
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Mousewheel, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { useIdeologyStore } from '../../stores/ideology'

const store = useIdeologyStore()
const swiperModules = [Pagination, Mousewheel]

const issues = computed(() => store.listActiveIssues())
const selectedIssueId = ref(issues.value[0]?.id || '')
const selectedIssue = computed(() => issues.value.find(i => i.id === selectedIssueId.value) || null)

const swiperRef = ref(null)
const historyOpen = ref(false)

function onSwiperReady(swiper) {
  swiperRef.value = swiper
  const idx = issues.value.findIndex(i => i.id === selectedIssueId.value)
  if (idx >= 0) swiper.slideTo(idx, 0)
}

function onSlideChange(swiper) {
  const i = issues.value[swiper.activeIndex]
  if (i) selectedIssueId.value = i.id
}

function selectIssue(id) {
  selectedIssueId.value = id
  const idx = issues.value.findIndex(x => x.id === id)
  if (swiperRef.value && idx >= 0) swiperRef.value.slideTo(idx)
}

watch(
  () => issues.value.map(x => x.id).join(','),
  () => {
    if (!selectedIssueId.value && issues.value.length) selectedIssueId.value = issues.value[0].id
    const idx = issues.value.findIndex(i => i.id === selectedIssueId.value)
    if (swiperRef.value && idx >= 0) swiperRef.value.slideTo(idx, 0)
  },
)

const material = computed(() => {
  if (!selectedIssue.value) return store.MATERIALS[0]
  return store.getMaterialById(selectedIssue.value.materialId)
})

const speechStats = computed(() => {
  const list = store.speeches.filter(s => s.issueId === selectedIssueId.value && s.humanStatus === 'approved')
  return { approvedCount: list.length }
})

/** 正方/反方已通过发言数，用于 PK 条展示（真实业务数据） */
const pkCounts = computed(() => {
  const list = store.speeches.filter(s => s.issueId === selectedIssueId.value && s.humanStatus === 'approved')
  let positive = 0
  let negative = 0
  for (const s of list) {
    if (s.side === 'negative') negative++
    else positive++
  }
  return { positive, negative }
})

const positivePct = computed(() => {
  const { positive, negative } = pkCounts.value
  const t = positive + negative
  if (!t) return 50
  return Math.round((positive / t) * 100)
})

const negativePct = computed(() => 100 - positivePct.value)

const approvedSpeeches = computed(() => {
  return store.speeches
    .filter(s => s.issueId === selectedIssueId.value && s.humanStatus === 'approved')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
})

const mySpeechCount = computed(() => {
  return store.speeches.filter(
    s => String(s.issueId) === String(selectedIssueId.value) && String(s.userId) === String(store.curUserId) && s.humanStatus !== 'rejected',
  ).length
})

const side = ref('positive')
const speechDraft = ref('')
const submitLoading = ref(false)
const submitError = ref('')

function lenCN(s) {
  return [...String(s || '')].length
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  return `${d}天前`
}

function timeLabel(issue) {
  if (!issue) return ''
  if (issue.status === 'closed') return '周期结束'
  const left = Math.max(0, issue.endAt - Date.now())
  const days = Math.ceil(left / (24 * 3600 * 1000))
  return `剩余约 ${days} 天`
}

function isFav(speechId) {
  return Boolean(store.speechFavorites.find(f => f.speechId === speechId && String(f.userId) === String(store.curUserId)))
}

async function submitSpeech() {
  submitError.value = ''
  if (!selectedIssue.value) return
  submitLoading.value = true
  try {
    await store.submitSpeech({
      issueId: selectedIssueId.value,
      side: side.value,
      content: speechDraft.value,
    })
    speechDraft.value = ''
    submitError.value = ''
  } catch (e) {
    submitError.value = e?.message || '提交失败'
  } finally {
    submitLoading.value = false
  }
}

async function likeSpeech(speechId) {
  try {
    await store.toggleSpeechLike({ speechId })
  } catch (e) {
    alert(e.message || '点赞失败')
  }
}

async function favSpeech(speechId) {
  try {
    await store.toggleSpeechFavorite({ speechId })
  } catch (e) {
    alert(e.message || '收藏失败')
  }
}

const speechCommentDrafts = reactive({})
const speechCommentDraftsErr = reactive({})

function commentsBySpeech(speechId) {
  return store.speechComments.filter(c => c.speechId === speechId).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

async function submitSpeechComment(speechId) {
  const text = speechCommentDrafts[speechId] || ''
  speechCommentDraftsErr[speechId] = ''
  try {
    await store.submitSpeechComment({ speechId, text })
    speechCommentDrafts[speechId] = ''
  } catch (e) {
    speechCommentDraftsErr[speechId] = e?.message || '评论失败'
  }
}

const issueSummaryDraft = ref('')
const summaryLoading = ref(false)
const summaryError = ref('')

async function submitIssueSummary() {
  if (!selectedIssue.value) return
  summaryError.value = ''
  summaryLoading.value = true
  try {
    await store.submitIssueSummary({ issueId: selectedIssueId.value, text: issueSummaryDraft.value })
    issueSummaryDraft.value = ''
  } catch (e) {
    summaryError.value = e?.message || '提交失败'
  } finally {
    summaryLoading.value = false
  }
}

onMounted(() => {
  if (!selectedIssueId.value && issues.value.length) selectedIssueId.value = issues.value[0].id
})
</script>

<style scoped>
/* PK 标识轻微脉动 */
.pk-vs {
  animation: pk-pulse 2s ease-in-out infinite;
}
@keyframes pk-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.06);
    opacity: 0.92;
  }
}

/* 进行中标签呼吸 */
.badge-breathe {
  animation: breathe 2.2s ease-in-out infinite;
}
@keyframes breathe {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.35);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
}

/* 进度条加载感：光泽扫过 */
.vote-bar-fill {
  position: relative;
  overflow: hidden;
}
.vote-bar-blue::after,
.vote-bar-red::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  animation: bar-shine 2.2s ease-in-out infinite;
  pointer-events: none;
}
.vote-bar-red::after {
  animation-delay: 0.4s;
}
@keyframes bar-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.ideology-card {
  will-change: transform;
}

.btn-press:active:not(:disabled) {
  transform: scale(0.97);
}

.submit-glow {
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}
.submit-glow:hover:not(:disabled) {
  box-shadow: 0 8px 24px rgba(127, 29, 29, 0.35);
  transform: translateY(-1px);
}

.animate-fade-in {
  animation: fade-in 0.35s ease-out;
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

:deep(.issue-swiper .swiper-pagination-bullet-active) {
  background: #7f1d1d;
}
</style>
