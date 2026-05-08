<template>
  <div class="ideology-admin space-y-8">
    <!-- 顶部说明与统计 -->
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div>
        <h2 class="adm-page-title">思政辩论小广场</h2>
        <p class="text-sm text-stone-500 mt-1 max-w-2xl">
          发布与维护辩论议题、配置正反方立论提示、开关周期；已结束议题可填写专家总结（前台展示）。下方可审批参与者发言。
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <div class="adm-card px-4 py-2.5 text-sm text-stone-600 hover:shadow-md transition-shadow rounded-xl">
          议题：<strong class="text-red-900">{{ allIssues.length }}</strong>
        </div>
        <div class="adm-card px-4 py-2.5 text-sm text-stone-600 hover:shadow-md transition-shadow rounded-xl">
          发言：<strong class="text-red-900">{{ store.speeches.length }}</strong>
        </div>
      </div>
    </div>

    <div
      v-if="pageMsg"
      class="rounded-xl border px-4 py-3 text-sm"
      :class="pageMsgOk ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-800'"
    >
      {{ pageMsg }}
    </div>

    <!-- ========== 一、发布与编辑议题 ========== -->
    <section class="adm-card p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-red-900/10">
      <div class="flex items-center gap-2 mb-4">
        <span class="w-1 h-6 rounded-full bg-red-800 shrink-0" />
        <h3 class="text-base font-bold text-stone-900">议题发布与维护</h3>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <div class="rounded-xl border border-stone-200 bg-stone-50/80 p-4 space-y-3">
          <div class="text-sm font-bold text-stone-800">{{ issueForm.id ? '编辑议题' : '新增议题' }}</div>
          <div class="grid sm:grid-cols-2 gap-3">
            <label class="block text-xs text-stone-600 sm:col-span-2">
              标题
              <input v-model="issueForm.title" type="text" class="adm-input mt-1 w-full" placeholder="10 字以上" />
            </label>
            <label class="block text-xs text-stone-600">
              分类
              <input v-model="issueForm.category" type="text" class="adm-input mt-1 w-full" list="debate-cats" />
              <datalist id="debate-cats">
                <option value="红色精神思辨类" />
                <option value="青年成长抉择类" />
                <option value="时代责任担当类" />
              </datalist>
            </label>
            <label class="block text-xs text-stone-600">
              周期（天，3–7）
              <input v-model.number="issueForm.durationDays" type="number" min="3" max="7" class="adm-input mt-1 w-full" />
            </label>
            <label class="block text-xs text-stone-600 sm:col-span-2">
              关联红色素材
              <select v-model="issueForm.materialId" class="adm-select mt-1 w-full py-2">
                <option v-for="m in store.MATERIALS" :key="m.id" :value="m.id">{{ m.martyr }} — {{ m.spirit }}</option>
              </select>
            </label>
            <label class="block text-xs text-stone-600 sm:col-span-2">
              正方立论提示
              <textarea v-model="issueForm.positive" rows="2" class="adm-input mt-1 w-full resize-none" />
            </label>
            <label class="block text-xs text-stone-600 sm:col-span-2">
              反方立论提示
              <textarea v-model="issueForm.negative" rows="2" class="adm-input mt-1 w-full resize-none" />
            </label>
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            <button type="button" class="adm-btn-primary text-sm px-4 py-2" @click="saveIssue">
              {{ issueForm.id ? '保存修改' : '发布新议题' }}
            </button>
            <button v-if="issueForm.id" type="button" class="adm-btn-danger text-sm px-4 py-2 opacity-90" @click="resetIssueForm">
              取消编辑
            </button>
          </div>
        </div>

        <div class="text-xs text-stone-500 leading-relaxed rounded-xl border border-dashed border-stone-200 p-4 bg-white">
          <p class="font-bold text-stone-700 mb-2">说明</p>
          <ul class="list-disc pl-4 space-y-1">
            <li>新议题默认<strong>开启</strong>（进行中），周期按天计算结束时间。</li>
            <li>可在列表卡片上<strong>手动关闭</strong>或<strong>重新开启</strong>；重新开启时若已过期，将按周期顺延结束时间。</li>
            <li>删除议题会同时移除该议题下全部发言及关联评论、点赞、收藏（不可恢复）。</li>
          </ul>
        </div>
      </div>

      <div v-if="allIssues.length === 0" class="text-center py-10 text-stone-400 mt-4">暂无议题</div>
      <div v-else class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        <div
          v-for="it in allIssues"
          :key="it.id"
          class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="text-xs text-stone-500">{{ it.category }}</div>
              <div class="font-bold text-stone-900 mt-0.5 line-clamp-2">{{ it.title }}</div>
            </div>
            <span
              class="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
              :class="it.status === 'published' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-100 text-stone-600 border-stone-200'"
            >
              {{ it.status === 'published' ? '进行中' : '已结束' }}
            </span>
          </div>
          <div class="text-xs text-stone-500 mt-2 space-y-0.5">
            <div>周期 {{ it.durationDays }} 天 · 结束 {{ formatTime(it.endAt) }}</div>
            <div class="line-clamp-2 text-stone-600">正：{{ it.sides?.positive }}</div>
            <div class="line-clamp-2 text-stone-600">反：{{ it.sides?.negative }}</div>
          </div>
          <div class="mt-auto pt-4 flex flex-wrap gap-2">
            <button type="button" class="adm-btn-primary text-xs px-2.5 py-1.5" @click="loadIssueForEdit(it)">编辑</button>
            <button
              v-if="it.status === 'published'"
              type="button"
              class="adm-btn-danger text-xs px-2.5 py-1.5"
              @click="toggleIssueOpen(it, 'closed')"
            >
              关闭议题
            </button>
            <button
              v-else
              type="button"
              class="adm-btn-primary text-xs px-2.5 py-1.5 bg-stone-700 hover:bg-stone-800 border-stone-700"
              @click="toggleIssueOpen(it, 'published')"
            >
              开启议题
            </button>
            <button type="button" class="adm-btn-danger text-xs px-2.5 py-1.5 ml-auto" @click="removeIssue(it)">删除</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 二、专家总结（已结束议题） ========== -->
    <section class="adm-card p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-red-900/10">
      <div class="flex items-center gap-2 mb-4">
        <span class="w-1 h-6 rounded-full bg-amber-600 shrink-0" />
        <h3 class="text-base font-bold text-stone-900">专家总结（前台「已结束」区块展示）</h3>
      </div>
      <p class="text-xs text-stone-500 mb-4">选择已结束议题，填写点评与备注后保存；不会误把进行中的议题关闭。</p>

      <div v-if="closedIssues.length === 0" class="text-stone-400 text-sm py-6 text-center rounded-xl bg-stone-50 border border-stone-100">
        当前没有已结束议题
      </div>
      <div v-else class="grid lg:grid-cols-2 gap-4">
        <div class="rounded-xl border border-stone-200 bg-stone-50/60 p-3 max-h-64 overflow-y-auto space-y-2">
          <button
            v-for="it in closedIssues"
            :key="it.id"
            type="button"
            @click="selectSummaryIssue(it)"
            class="w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-all"
            :class="
              summaryForm.issueId === it.id
                ? 'border-red-800 bg-white shadow-md ring-1 ring-red-900/15'
                : 'border-stone-200 bg-white hover:border-red-300 hover:shadow'
            "
          >
            <div class="font-bold text-stone-900 line-clamp-1">{{ it.title }}</div>
            <div class="text-xs text-stone-500 mt-0.5">{{ it.category }}</div>
          </button>
        </div>
        <div v-if="summaryForm.issueId" class="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
          <label class="block text-xs text-stone-600">
            专家署名
            <input v-model="summaryForm.expertName" type="text" class="adm-input mt-1 w-full" />
          </label>
          <label class="block text-xs text-stone-600">
            总结正文（思政点评）
            <textarea v-model="summaryForm.summary" rows="5" class="adm-input mt-1 w-full resize-none" placeholder="前台用户可见的主要总结" />
          </label>
          <label class="block text-xs text-stone-600">
            备注（可选）
            <textarea v-model="summaryForm.remark" rows="2" class="adm-input mt-1 w-full resize-none" />
          </label>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="adm-btn-primary text-sm px-4 py-2" @click="saveSummary">保存专家总结</button>
            <button
              type="button"
              class="adm-btn-danger text-sm px-4 py-2 opacity-90"
              @click="closeWithSummary"
            >
              关闭并写入总结（结束时间设为现在）
            </button>
          </div>
        </div>
        <div v-else class="flex items-center justify-center text-stone-400 text-sm rounded-xl border border-dashed border-stone-200 min-h-[200px]">
          请从左侧选择一个已结束议题
        </div>
      </div>
    </section>

    <!-- ========== 三、发言审核 ========== -->
    <section class="adm-card p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-red-900/10">
      <div class="flex items-center gap-2 mb-4">
        <span class="w-1 h-6 rounded-full bg-red-800 shrink-0" />
        <h3 class="text-base font-bold text-stone-900">发言审核</h3>
      </div>
      <p class="text-xs text-stone-500 mb-4">通过/驳回；前台仅展示已通过内容。通过时可勾选优质观点（+15）。</p>

      <div class="flex items-center gap-3 flex-wrap mb-4">
        <select v-model="statusFilter" class="adm-select w-36 py-2">
          <option value="all">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已驳回</option>
        </select>
        <select v-model="issueFilter" class="adm-select w-56 py-2">
          <option value="all">全部议题</option>
          <option v-for="i in allIssues" :key="i.id" :value="i.id">{{ i.title }}</option>
        </select>
      </div>

      <div v-if="filteredSpeeches.length === 0" class="text-center py-12 text-stone-400">暂无符合条件的发言</div>
      <div v-else class="space-y-3">
        <div
          v-for="s in filteredSpeeches"
          :key="s.id"
          class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="adm-badge adm-badge-admin">{{ issueTitle(s.issueId) }}</span>
                <span class="adm-badge adm-badge-warn">{{ s.side === 'positive' ? '正方' : '反方' }}</span>
                <span v-if="s.humanStatus === 'pending'" class="adm-badge adm-badge-warn">待审核</span>
                <span v-else-if="s.humanStatus === 'approved'" class="adm-badge adm-badge-success">已通过</span>
                <span v-else class="adm-badge adm-badge-danger">已驳回</span>
                <span class="px-2 py-0.5 bg-stone-50 text-stone-600 text-xs rounded-full">{{ timeAgo(s.createdAt) }}</span>
              </div>
              <div class="text-sm font-bold text-stone-900 mt-2 truncate">{{ s.username || '匿名' }}</div>
            </div>
            <label v-if="s.humanStatus === 'pending'" class="text-xs text-stone-600 flex items-center gap-2">
              <input type="checkbox" v-model="qualityFlag[s.id]" />
              标记优质观点（+15）
            </label>
          </div>
          <div class="text-sm text-stone-700 mt-3 whitespace-pre-wrap leading-relaxed line-clamp-4">{{ s.content }}</div>
          <div class="mt-4 flex items-center justify-end gap-3 flex-wrap">
            <div class="text-xs text-stone-500 mr-auto">
              AI：{{ s.aiStatus === 'pass' ? '通过' : '未通过' }}{{ s.aiReason ? ` · ${s.aiReason}` : '' }}
            </div>
            <button
              v-if="s.humanStatus === 'pending'"
              type="button"
              @click="audit(s.id, 'approve')"
              class="adm-btn-primary text-xs px-3 py-1.5"
            >
              通过
            </button>
            <button
              v-if="s.humanStatus === 'pending'"
              type="button"
              @click="audit(s.id, 'reject')"
              class="adm-btn-danger text-xs px-3 py-1.5"
            >
              驳回
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useIdeologyStore } from '../../stores/ideology'

const store = useIdeologyStore()

const pageMsg = ref('')
const pageMsgOk = ref(true)
let msgTimer = 0

function flashMsg(text, ok = true) {
  pageMsg.value = text
  pageMsgOk.value = ok
  clearTimeout(msgTimer)
  msgTimer = setTimeout(() => {
    pageMsg.value = ''
  }, 4200)
}

const allIssues = computed(() => {
  const list = store.listActiveIssues ? store.listActiveIssues() : [...store.issues]
  return list.slice().sort((a, b) => (b.startAt || 0) - (a.startAt || 0))
})

const closedIssues = computed(() => allIssues.value.filter(i => i.status === 'closed'))

const issueForm = reactive({
  id: '',
  title: '',
  category: '青年成长抉择类',
  materialId: store.MATERIALS[0]?.id || 'm1',
  positive: '',
  negative: '',
  durationDays: 5,
})

function resetIssueForm() {
  issueForm.id = ''
  issueForm.title = ''
  issueForm.category = '青年成长抉择类'
  issueForm.materialId = store.MATERIALS[0]?.id || 'm1'
  issueForm.positive = ''
  issueForm.negative = ''
  issueForm.durationDays = 5
}

function loadIssueForEdit(it) {
  issueForm.id = it.id
  issueForm.title = it.title
  issueForm.category = it.category
  issueForm.materialId = it.materialId || 'm1'
  issueForm.positive = it.sides?.positive || ''
  issueForm.negative = it.sides?.negative || ''
  issueForm.durationDays = it.durationDays || 5
}

async function saveIssue() {
  try {
    if (issueForm.id) {
      await store.adminUpdateIssue({
        issueId: issueForm.id,
        category: issueForm.category,
        title: issueForm.title,
        materialId: issueForm.materialId,
        positive: issueForm.positive,
        negative: issueForm.negative,
        durationDays: issueForm.durationDays,
      })
      flashMsg('议题已更新')
    } else {
      await store.adminCreateIssue({
        category: issueForm.category,
        title: issueForm.title,
        materialId: issueForm.materialId,
        positive: issueForm.positive,
        negative: issueForm.negative,
        durationDays: issueForm.durationDays,
      })
      flashMsg('新议题已发布')
      resetIssueForm()
    }
  } catch (e) {
    flashMsg(e?.message || '保存失败', false)
  }
}

async function toggleIssueOpen(it, status) {
  const tip = status === 'closed' ? '确定关闭该议题？用户将无法继续提交发言。' : '确定重新开启？若已过期将自动顺延结束时间。'
  if (!confirm(tip)) return
  try {
    await store.adminSetIssueStatus({ issueId: it.id, status })
    flashMsg(status === 'closed' ? '议题已关闭' : '议题已开启')
  } catch (e) {
    flashMsg(e?.message || '操作失败', false)
  }
}

async function removeIssue(it) {
  if (!confirm(`确定删除议题「${it.title}」？其下全部发言与互动记录将一并删除。`)) return
  try {
    await store.adminDeleteIssue({ issueId: it.id })
    if (issueForm.id === it.id) resetIssueForm()
    if (summaryForm.issueId === it.id) {
      summaryForm.issueId = ''
      summaryForm.expertName = ''
      summaryForm.summary = ''
      summaryForm.remark = ''
    }
    flashMsg('议题已删除')
  } catch (e) {
    flashMsg(e?.message || '删除失败', false)
  }
}

const summaryForm = reactive({
  issueId: '',
  expertName: '',
  summary: '',
  remark: '',
})

function selectSummaryIssue(it) {
  summaryForm.issueId = it.id
  summaryForm.expertName = it.teacher?.expertName || '专家顾问（人工）'
  summaryForm.summary = it.teacher?.summary || ''
  summaryForm.remark = it.teacher?.remark || ''
}

watch(closedIssues, list => {
  if (summaryForm.issueId && !list.some(x => x.id === summaryForm.issueId)) summaryForm.issueId = ''
})

async function saveSummary() {
  if (!summaryForm.issueId) return
  try {
    await store.adminUpdateTeacher({
      issueId: summaryForm.issueId,
      expertName: summaryForm.expertName,
      teacherSummary: summaryForm.summary,
      remark: summaryForm.remark,
    })
    flashMsg('专家总结已保存，前台将同步展示')
  } catch (e) {
    flashMsg(e?.message || '保存失败', false)
  }
}

async function closeWithSummary() {
  if (!summaryForm.issueId) return
  if (!confirm('将议题立即结束（结束时间为现在），并写入当前总结框内容。确定？')) return
  try {
    await store.adminCloseIssue({
      issueId: summaryForm.issueId,
      expertName: summaryForm.expertName,
      teacherSummary: summaryForm.summary,
      remark: summaryForm.remark,
    })
    flashMsg('议题已关闭，总结已写入')
  } catch (e) {
    flashMsg(e?.message || '操作失败', false)
  }
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

// ----- 发言审核 -----
const statusFilter = ref('all')
const issueFilter = ref('all')
const qualityFlag = reactive({})

const filteredSpeeches = computed(() => {
  let list = store.speeches || []
  if (issueFilter.value !== 'all') list = list.filter(s => String(s.issueId) === String(issueFilter.value))
  if (statusFilter.value !== 'all') list = list.filter(s => s.humanStatus === statusFilter.value)
  return list.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
})

function issueTitle(issueId) {
  const i = store.issues.find(x => String(x.id) === String(issueId))
  return i?.title || String(issueId)
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

async function audit(speechId, action) {
  try {
    const setQuality = action === 'approve' ? Boolean(qualityFlag[speechId]) : false
    await store.adminAuditSpeech({ speechId, action, setQuality })
    flashMsg(action === 'approve' ? '已通过' : '已驳回')
  } catch (e) {
    flashMsg(e?.message || '操作失败', false)
  }
}
</script>
