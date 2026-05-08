<template>
  <div class="growth-hall space-y-5">
    <!-- 顶部：积分滚动 + 等级条 -->
    <div class="ideology-card rounded-2xl border border-red-900/15 bg-gradient-to-br from-white to-red-50/40 p-4 md:p-5 shadow-lg">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-red-900 mb-1">红色精神成长积分体系</h2>
          <p class="text-sm text-stone-500 max-w-xl">
            思辨发观点、解惑写感悟、践行做记录、合规互动得成长。全部计入同一份成长档案。
          </p>
        </div>
        <div class="text-right shrink-0">
          <div class="text-xs text-stone-500">当前积分</div>
          <div class="text-4xl font-black text-red-900 leading-none tabular-nums tracking-tight">
            {{ displayPoints }}
          </div>
          <div class="text-sm text-stone-500 mt-2">
            等级：<strong class="text-amber-900">{{ store.myLevel.icon }} {{ store.myLevel.key }}</strong>
          </div>
        </div>
      </div>

      <!-- 下一等级进度（与 store 中 LEVELS 阈值一致） -->
      <div class="mt-5">
        <div class="flex justify-between text-xs text-stone-600 mb-1.5">
          <span>距离下一等级</span>
          <span v-if="levelProgress.next">
            还需 <strong class="text-red-900">{{ levelProgress.need }}</strong> 分 → {{ levelProgress.next.icon }} {{ levelProgress.next.key }}
          </span>
          <span v-else class="text-amber-800 font-bold">已达最高等级</span>
        </div>
        <div class="h-3 rounded-full bg-stone-200 overflow-hidden shadow-inner">
          <div
            class="h-full rounded-full bg-gradient-to-r from-red-800 via-red-600 to-amber-500 level-bar-fill transition-[width] duration-1000 ease-out"
            :style="{ width: `${levelProgress.pct}%` }"
          />
        </div>
      </div>
    </div>

    <!-- 三 Tab：滑动指示条 + 面板过渡 -->
    <div class="rounded-2xl border border-amber-700/15 bg-white shadow-lg overflow-hidden">
      <div class="relative border-b border-stone-100 bg-stone-50/80 px-2 pt-2">
        <div class="flex">
          <button
            v-for="(t, i) in tabs"
            :key="t.id"
            type="button"
            @click="activeTab = i"
            :class="[
              'flex-1 py-3 text-sm font-bold rounded-t-xl transition-all duration-300 relative z-10',
              activeTab === i ? 'text-red-900' : 'text-stone-500 hover:text-stone-800',
            ]"
          >
            {{ t.label }}
          </button>
        </div>
        <!-- 滑动下划线：宽度 1/3，translateX 以自身宽度为步长切换三 Tab -->
        <span
          class="pointer-events-none absolute bottom-0 left-2 h-0.5 w-[calc((100%-1rem)/3)] bg-red-900 rounded-full transition-transform duration-300 ease-out"
          :style="{ transform: `translateX(${activeTab * 100}%)` }"
        />
      </div>

      <div class="tab-panels relative min-h-[320px]">
        <transition :name="tabTransition" mode="out-in">
          <!-- Tab0：等级权益 -->
          <div v-if="activeTab === 0" key="t0" class="p-4 md:p-5">
            <div class="font-bold text-stone-900 mb-2">等级权益（精神权益，不兑换实物）</div>
            <div class="text-sm text-stone-600 mb-3">达标解锁电子证书、研学资格、荣誉勋章等。</div>
            <ul class="space-y-2">
              <li
                v-for="r in store.myLevel.rights"
                :key="r"
                class="ideology-card text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
              >
                {{ r }}
              </li>
            </ul>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                @click="downloadCertificate"
                class="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-500 transition-all border-0 cursor-pointer btn-anim shadow-md hover:-translate-y-0.5"
              >
                下载电子证书（文本）
              </button>
              <button
                type="button"
                @click="downloadReport"
                class="px-4 py-2.5 rounded-xl bg-red-900 text-white text-sm font-bold hover:bg-red-800 transition-all border-0 cursor-pointer btn-anim shadow-md hover:-translate-y-0.5"
              >
                下载我的思政成长报告
              </button>
            </div>
          </div>

          <!-- Tab1：成长档案时间轴 -->
          <div v-else-if="activeTab === 1" key="t1" class="p-4 md:p-5">
            <div class="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div class="font-bold text-stone-900">我的成长档案（时间轴）</div>
              <div class="text-xs text-stone-500">
                最近 {{ store.myEvents.length > 0 ? Math.min(30, store.myEvents.length) : 0 }} 条
              </div>
            </div>
            <div v-if="store.myEvents.length === 0" class="text-sm text-stone-500 py-10 text-center">
              暂无成长记录：请先参与“思政辩论小广场”或“红色精神解忧站”
            </div>
            <div v-else class="timeline-wrap max-h-[min(70vh,560px)] overflow-y-auto pr-2">
              <div class="relative pl-6 border-l-2 border-red-200/80 ml-2 space-y-0 pb-2">
                <div
                  v-for="e in store.myEvents.slice(0, 60)"
                  :key="e.id"
                  class="timeline-item relative pb-6 last:pb-2"
                >
                  <span
                    class="absolute -left-[1.36rem] top-1.5 w-3 h-3 rounded-full bg-red-700 ring-4 ring-red-100 shadow-sm"
                    aria-hidden="true"
                  />
                  <div
                    class="ideology-card ml-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                  >
                    <div class="flex items-start justify-between gap-3 flex-wrap">
                      <div class="text-xs text-stone-500 font-medium">
                        {{ new Date(e.createdAt).toLocaleString('zh-CN') }}
                      </div>
                      <div class="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
                        +{{ e.points }} 分
                      </div>
                    </div>
                    <div class="text-sm text-stone-800 font-bold mt-2">{{ titleOfEvent(e.type) }}</div>
                    <div class="text-xs text-stone-600 mt-1" v-if="eventSummary(e)">{{ eventSummary(e) }}</div>
                    <div class="text-xs text-stone-400 mt-1 line-clamp-3" v-if="e.meta?.text">{{ e.meta.text }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-end">
              <button
                type="button"
                @click="tryCompleteArchive"
                :disabled="!store.canCompleteArchive()"
                :class="[
                  'px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-0 cursor-pointer btn-anim',
                  store.canCompleteArchive()
                    ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-md hover:-translate-y-0.5'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed',
                ]"
              >
                完善成长档案（+15）
              </button>
            </div>
          </div>

          <!-- Tab2：精神践行 -->
          <div v-else key="t2" class="p-4 md:p-5">
            <h3 class="font-bold text-red-900 mb-2">精神践行（30%）/ 记录践行事迹</h3>
            <p class="text-sm text-stone-500 mb-4">你可以把困惑解开后的“下一步”变成可执行的践行记录。</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="ideology-card rounded-2xl border border-stone-200 bg-stone-50 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                <label class="block text-xs text-stone-600 mb-2">践行类型</label>
                <select
                  v-model="practice.kind"
                  class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900"
                >
                  <option value="small">记录践行小事（+12）</option>
                  <option value="evidence">上传佐证（+18）</option>
                  <option value="online">参与线上实践活动（+7）</option>
                  <option value="share">分享心得（+8）</option>
                </select>

                <div class="mt-3" v-if="practice.kind === 'evidence'">
                  <label class="block text-xs text-stone-600 mb-1">佐证名称（例如：截图/记录/链接标题）</label>
                  <input
                    v-model="practice.evidenceName"
                    type="text"
                    class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-900"
                    placeholder="输入一个可识别的佐证名称"
                  />
                </div>
                <div class="mt-3" v-if="practice.kind === 'online'">
                  <label class="block text-xs text-stone-600 mb-1">线上实践活动标题</label>
                  <input
                    v-model="practice.onlineTitle"
                    type="text"
                    class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-900"
                    placeholder="例如：线上红色研学打卡（第X期）"
                  />
                </div>

                <div class="mt-3">
                  <label class="block text-xs text-stone-600 mb-1">内容</label>
                  <textarea
                    v-model="practice.text"
                    rows="4"
                    class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-red-900"
                    placeholder="写下你做了什么、为什么做、下一步怎么改进…"
                  />
                  <div class="text-xs text-stone-500 mt-1">建议 40-800 字</div>
                </div>

                <div class="mt-4 flex justify-end">
                  <button
                    type="button"
                    @click="addPractice"
                    :disabled="practiceLoading"
                    class="px-5 py-2.5 rounded-xl bg-red-900 text-white text-sm font-bold border-0 cursor-pointer disabled:opacity-50 flex items-center gap-2 btn-anim hover:-translate-y-0.5 hover:shadow-lg shadow-md"
                  >
                    <span
                      v-if="practiceLoading"
                      class="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    {{ practiceLoading ? '保存中…' : '提交践行记录' }}
                  </button>
                </div>
                <div v-if="practiceErr" class="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {{ practiceErr }}
                </div>
              </div>

              <div class="ideology-card rounded-2xl border border-stone-200 bg-stone-50 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                <div class="font-bold text-stone-900 mb-2">合规互动（10%）提示</div>
                <div class="text-sm text-stone-600 space-y-2">
                  <p>· 点赞与评论获得 +2（每日上限 10 分）</p>
                  <p>· 完善成长档案满足条件后获得 +15</p>
                  <p>· 你可以在“辩论小广场”和“解忧站”里完成互动</p>
                </div>
                <div class="mt-4 bg-white border border-stone-200 rounded-2xl p-3">
                  <div class="text-xs text-stone-500">今日上限状态（展示）</div>
                  <div class="text-sm font-bold text-amber-900 mt-1">今日互动积分将受限于系统上限</div>
                </div>
                <div class="mt-4">
                  <button
                    type="button"
                    @click="$router.push('/ideology')"
                    class="w-full px-4 py-2.5 rounded-xl bg-white text-red-900 text-sm font-bold hover:bg-stone-50 transition-all border border-red-900/20 cursor-pointer btn-anim hover:-translate-y-0.5"
                  >
                    去完成互动与成长
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useIdeologyStore } from '../../stores/ideology'

/** 与 ideology store 中 LEVELS.minPoints 保持一致，用于进度条计算 */
const LEVEL_THRESHOLDS = [
  { key: '初心学徒', minPoints: 0, icon: '🎓' },
  { key: '笃行少年', minPoints: 200, icon: '📚' },
  { key: '先锋志士', minPoints: 450, icon: '🛠️' },
  { key: '精神传承者', minPoints: 750, icon: '🧭' },
  { key: '时代新青年', minPoints: 1100, icon: '🏅' },
]

const store = useIdeologyStore()

const tabs = [
  { id: 'rights', label: '等级权益' },
  { id: 'archive', label: '成长档案' },
  { id: 'practice', label: '精神践行' },
]
const activeTab = ref(0)
const tabTransition = ref('tab-slide-left')

watch(activeTab, (n, o) => {
  tabTransition.value = n > o ? 'tab-slide-left' : 'tab-slide-right'
})

const practice = reactive({
  kind: 'small',
  text: '',
  evidenceName: '',
  onlineTitle: '',
})
const practiceLoading = ref(false)
const practiceErr = ref('')

/** 积分数字滚动展示 */
const displayPoints = ref(0)
let pointsAnimFrame = 0

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

function animatePointsTo(target) {
  const start = displayPoints.value
  if (start === target) return
  const t0 = performance.now()
  const dur = 650
  cancelAnimationFrame(pointsAnimFrame)
  const step = now => {
    const u = Math.min(1, (now - t0) / dur)
    displayPoints.value = Math.round(start + (target - start) * easeOutCubic(u))
    if (u < 1) pointsAnimFrame = requestAnimationFrame(step)
  }
  pointsAnimFrame = requestAnimationFrame(step)
}

watch(
  () => store.myPoints,
  v => animatePointsTo(v),
  { immediate: true },
)

const levelProgress = computed(() => {
  const p = store.myPoints
  let cur = LEVEL_THRESHOLDS[0]
  let next = null
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (p >= LEVEL_THRESHOLDS[i].minPoints) cur = LEVEL_THRESHOLDS[i]
  }
  const idx = LEVEL_THRESHOLDS.findIndex(x => x.key === cur.key)
  if (idx >= 0 && idx < LEVEL_THRESHOLDS.length - 1) next = LEVEL_THRESHOLDS[idx + 1]
  if (!next) return { pct: 100, need: 0, next: null }
  const span = next.minPoints - cur.minPoints
  const gained = p - cur.minPoints
  const pct = Math.min(100, Math.max(0, Math.round((gained / span) * 100)))
  return { pct, need: Math.max(0, next.minPoints - p), next }
})

function titleOfEvent(type) {
  const map = {
    debate_speech_approved: '辩论发观点（已通过）',
    debate_speech_quality: '优质观点（审核标记）',
    debate_issue_summary: '完成思政小结',
    relief_insight: '解忧站发感悟',
    relief_insight_quality: '优质感悟（审核标记）',
    practice_small: '记录践行小事',
    practice_evidence: '上传佐证',
    practice_online: '参与线上实践活动',
    practice_share: '分享心得',
    interaction_like_comment: '合规互动（点赞/评论）',
    growth_archive_complete: '完善成长档案',
  }
  return map[type] || type
}

function eventSummary(e) {
  if (!e?.meta) return ''
  if (e.meta.issueId) return `议题：${String(e.meta.issueId).slice(0, 8)}…`
  if (e.meta.reliefId) return `解忧：${String(e.meta.reliefId).slice(0, 8)}…`
  if (e.meta.kind) return `类型：${e.meta.kind}`
  if (e.meta.onlineTitle) return `活动：${e.meta.onlineTitle}`
  if (e.meta.evidenceName) return `佐证：${e.meta.evidenceName}`
  return ''
}

async function addPractice() {
  practiceErr.value = ''
  practiceLoading.value = true
  try {
    await store.addPractice({
      kind: practice.kind,
      text: practice.text,
      evidenceName: practice.evidenceName,
      onlineTitle: practice.onlineTitle,
    })
    practice.text = ''
    practice.evidenceName = ''
    practice.onlineTitle = ''
  } catch (e) {
    practiceErr.value = e?.message || '保存失败'
  } finally {
    practiceLoading.value = false
  }
}

async function tryCompleteArchive() {
  try {
    store.completeArchive()
    alert('成长档案已完善（+15）')
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadReport() {
  const text = store.getDownloadReportText()
  downloadText(`思政成长报告_${store.curUser?.username || store.curUserId}.txt`, text)
}

function downloadCertificate() {
  const lv = store.myLevel
  const p = store.myPoints
  const u = store.curUser?.username || '匿名'
  const text = [
    `红色精神成长电子证书（localStorage版）`,
    ``,
    `持有人：${u}`,
    `等级：${lv.icon} ${lv.key}`,
    `当前积分：${p} 分`,
    `签发：思政成长馆（本地模拟）`,
    `生成时间：${new Date().toLocaleString('zh-CN')}`,
    ``,
    `权益说明：`,
    ...lv.rights.map(r => `- ${r}`),
  ].join('\n')
  downloadText(`电子证书_${lv.key}_${u}.txt`, text)
}

</script>

<style scoped>
.ideology-card {
  will-change: transform;
}

/* Tab 切换滑动感 */
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}
.tab-slide-left-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.tab-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
.tab-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.tab-slide-right-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

/* 等级进度条光泽 */
.level-bar-fill {
  position: relative;
  overflow: hidden;
}
.level-bar-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  animation: level-shine 2.5s ease-in-out infinite;
}
@keyframes level-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.btn-anim:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
