<template>
  <div class="relief-admin space-y-8">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div>
        <h2 class="adm-page-title">红色精神解忧站 · 后台管理</h2>
        <p class="text-sm text-stone-500 mt-1 max-w-2xl">
          解读发布、优质感悟标记、评论置顶与删除统一在此完成；普通用户前台不展示任何管理入口。
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <div class="adm-card px-4 py-2.5 text-sm text-stone-600 hover:shadow-md transition-shadow rounded-xl">
          解忧条：<strong class="text-red-900">{{ store.reliefs.length }}</strong>
        </div>
        <div class="adm-card px-4 py-2.5 text-sm text-stone-600 hover:shadow-md transition-shadow rounded-xl">
          评论：<strong class="text-red-900">{{ store.reliefComments.length }}</strong>
        </div>
        <div class="adm-card px-4 py-2.5 text-sm text-stone-600 hover:shadow-md transition-shadow rounded-xl">
          感悟：<strong class="text-red-900">{{ store.reliefReflections.length }}</strong>
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

    <!-- 一、解读发布 -->
    <section class="adm-card p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-red-900/10">
      <div class="flex items-center gap-2 mb-2">
        <span class="w-1 h-6 rounded-full bg-red-800 shrink-0" />
        <h3 class="text-base font-bold text-stone-900">解读审核与发布</h3>
      </div>
      <p class="text-xs text-stone-500 mb-4">待发布（pending）条目：填写红色精神、行动建议后公开；发布后前台用户可见。</p>

      <div class="grid lg:grid-cols-2 gap-5">
        <div class="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 min-h-[200px]">
          <h4 class="text-sm font-bold text-stone-800 mb-3">待发布列表（{{ pendingReliefs.length }}）</h4>
          <div v-if="pendingReliefs.length === 0" class="text-sm text-stone-400 py-8 text-center">暂无待发布</div>
          <div v-else class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            <div
              v-for="r in pendingReliefs"
              :key="r.id"
              class="rounded-xl border border-stone-200 bg-white p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              :class="decodeEditor.reliefId === r.id ? 'ring-2 ring-red-900/20 border-red-200' : ''"
              @click="loadDecodeEditor(r)"
            >
              <div class="text-xs text-stone-500">分类：{{ r.type }} · {{ formatTime(r.createdAt) }}</div>
              <div class="text-xs text-stone-500">用户：{{ r.authorMode === 'anonymous' ? '匿名' : (r.authorName || '-') }}</div>
              <div class="text-sm text-stone-700 mt-2 line-clamp-3 whitespace-pre-wrap">{{ r.content }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-stone-200 bg-white p-4 shadow-inner">
          <h4 class="text-sm font-bold text-stone-800 mb-3">解读编辑器</h4>
          <div v-if="decodeEditor.reliefId === ''" class="text-sm text-stone-400 py-16 text-center border border-dashed border-stone-200 rounded-xl">
            点击左侧一条待发布解忧开始编辑
          </div>
          <div v-else class="space-y-3">
            <div class="text-xs text-stone-500">当前：{{ decodeEditor.type }}</div>
            <div class="grid sm:grid-cols-2 gap-3">
              <label class="block text-xs text-stone-600">
                红色精神
                <input v-model="decodeEditor.redSpirit" type="text" class="adm-input mt-1 w-full" />
              </label>
              <label class="block text-xs text-stone-600">
                先辈事迹
                <input v-model="decodeEditor.martyr" type="text" class="adm-input mt-1 w-full" />
              </label>
            </div>
            <label class="block text-xs text-stone-600">
              精神品质（逗号分隔，最多 3 个）
              <input v-model="decodeEditor.qualitiesStr" type="text" class="adm-input mt-1 w-full" placeholder="坚定,理性,自省" />
            </label>
            <label class="block text-xs text-stone-600">
              落地行动建议（每行一条）
              <textarea v-model="decodeEditor.actionAdviceStr" rows="5" class="adm-input mt-1 w-full resize-none" />
            </label>
            <div class="flex flex-wrap gap-2 pt-1">
              <button type="button" class="adm-btn-primary text-sm px-4 py-2" @click="publishDecode">发布解读并公开</button>
              <button type="button" class="adm-btn-danger text-sm px-4 py-2 opacity-80" @click="clearDecodeEditor">清空选择</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 二、优质感悟 -->
    <section class="adm-card p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-red-900/10">
      <div class="flex items-center gap-2 mb-2">
        <span class="w-1 h-6 rounded-full bg-amber-600 shrink-0" />
        <h3 class="text-base font-bold text-stone-900">优质感悟标记（+20）</h3>
      </div>
      <p class="text-xs text-stone-500 mb-4">已优质条目不可重复标记；操作后积分按本地规则发放。</p>
      <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        <div
          v-for="rf in reliefReflectionsList"
          :key="rf.id"
          class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="text-xs text-stone-500">
              {{ rf.username || '用户' }} · {{ rf.quality ? '已优质' : '未优质' }} · 赞 {{ rf.likes }} ·
              {{ reliefById(rf.reliefId)?.type || '解忧' }}
            </div>
            <button
              type="button"
              :disabled="rf.quality"
              @click="markQuality(rf.id)"
              class="text-xs font-bold px-3 py-1.5 rounded-xl border-0 cursor-pointer transition disabled:opacity-50"
              :class="rf.quality ? 'bg-stone-200 text-stone-500' : 'adm-btn-primary'"
            >
              标记为优质
            </button>
          </div>
          <div class="text-sm text-stone-700 whitespace-pre-wrap mt-2 line-clamp-5">{{ rf.text }}</div>
        </div>
        <div v-if="reliefReflectionsList.length === 0" class="text-center py-10 text-stone-400">暂无感悟数据</div>
      </div>
    </section>

    <!-- 三、评论管理 -->
    <section class="adm-card p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-red-900/10">
      <div class="flex items-center gap-2 mb-4">
        <span class="w-1 h-6 rounded-full bg-stone-600 shrink-0" />
        <h3 class="text-base font-bold text-stone-900">评论审核 · 置顶 / 删除</h3>
      </div>
      <p class="text-xs text-stone-500 mb-4">置顶仅对根评论生效；删除将级联移除该评论及所有回复。</p>

      <div class="flex items-center gap-3 flex-wrap mb-4">
        <select v-model="selectedReliefId" class="adm-select w-64 py-2">
          <option value="">请选择解忧</option>
          <option value="__all__">全部解忧评论</option>
          <option v-for="r in reliefOptions" :key="r.id" :value="r.id">{{ r.type }} · {{ formatTime(r.createdAt) }}</option>
        </select>
      </div>

      <div v-if="!selectedReliefId" class="text-center py-12 text-stone-400 rounded-xl bg-stone-50 border border-stone-100">
        请选择一个解忧条目或「全部」开始管理
      </div>

      <div v-else-if="isAllMode" class="space-y-3">
        <div v-if="allComments.length === 0" class="text-center py-12 text-stone-400">暂无任何评论</div>
        <div
          v-for="c in allComments"
          :key="c.id"
          class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="adm-badge adm-badge-admin">{{ reliefById(c.reliefId)?.type || '未分类' }}</span>
                <span class="adm-badge">{{ isRootComment(c) ? '根评论' : '回复' }}</span>
                <span v-if="c.pinned" class="adm-badge adm-badge-warn">置顶</span>
                <span class="adm-badge">{{ formatTime(c.createdAt) }}</span>
              </div>
              <div class="text-sm font-bold text-stone-900 mt-2 truncate">{{ c.username || '用户' }}</div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button v-if="isRootComment(c)" type="button" @click="toggleTop(c)" class="adm-btn-primary text-xs px-3 py-1.5">
                {{ c.pinned ? '取消置顶' : '置顶' }}
              </button>
              <button type="button" @click="deleteComment(c)" class="adm-btn-danger text-xs px-3 py-1.5">删除</button>
            </div>
          </div>
          <div class="text-sm text-stone-700 mt-3 whitespace-pre-wrap leading-relaxed line-clamp-4">{{ c.content }}</div>
        </div>
      </div>

      <div v-else class="space-y-3">
        <div class="rounded-xl border border-stone-200 bg-stone-50 p-4 mb-4">
          <div class="text-sm font-bold text-stone-900">
            选中：{{ selectedRelief?.type }} · {{ formatTime(selectedRelief?.createdAt) }}
          </div>
          <div class="text-xs text-stone-500 mt-1">
            作者：{{ selectedRelief?.authorMode === 'anonymous' ? '匿名用户' : (selectedRelief?.authorName || '用户') }}
          </div>
          <div class="text-xs text-stone-600 mt-2 line-clamp-3 whitespace-pre-wrap">{{ selectedRelief?.content }}</div>
          <div class="text-xs text-stone-500 mt-2">
            根评论：<strong class="text-red-900">{{ rootComments.length }}</strong> · 全部：<strong class="text-red-900">{{ commentsForRelief.length }}</strong>
          </div>
        </div>

        <div v-if="rootComments.length === 0" class="text-center py-12 text-stone-400">该解忧暂无评论</div>
        <div v-else class="space-y-2">
          <ReliefCommentNode
            v-for="c in rootComments"
            :key="c.id"
            :comment="c"
            :relief-id="selectedReliefId"
            :depth="0"
            :get-children-by-parent-id="getChildrenByParentId"
            :can-reply="false"
            :show-admin-controls="true"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useIdeologyStore } from '../../stores/ideology'
import ReliefCommentNode from '../ideology/ReliefCommentNode.vue'

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

// ----- 解读发布 -----
const pendingReliefs = computed(() =>
  store.reliefs.filter(r => r.humanStatus === 'pending').sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
)

const decodeEditor = reactive({
  reliefId: '',
  type: '',
  redSpirit: '',
  martyr: '',
  qualitiesStr: '',
  actionAdviceStr: '',
})

const RELIEF_FALLBACK = {
  学业: { spirit: '自律与坚韧', martyr: '张思德', action: ['把“当下的任务”拆成可完成的步骤', '用复盘减少焦虑，把努力落到细节'], qualitiesStr: '自律,坚韧,自省' },
  就业: { spirit: '脚踏实地与担当', martyr: '黄继光', action: ['遇到选择先问：是否对人民有益', '把能力建设做成长期行动计划'], qualitiesStr: '担当,务实,坚持' },
  人际: { spirit: '同理与边界', martyr: '向警予', action: ['先理解对方诉求，再表达自己的立场', '在尊重中坚持原则，形成良性沟通'], qualitiesStr: '同理,边界,理性' },
  奋斗倦怠: { spirit: '把热情转为节律', martyr: '刘胡兰', action: ['寻找“为什么”并写下来贴在桌前', '把目标变成每周可度量的小里程碑'], qualitiesStr: '信念,节律,行动' },
  理想: { spirit: '信念的延续与自我校准', martyr: '瞿秋白', action: ['用行动校准理想：今天做什么', '在挫折中回到价值坐标'], qualitiesStr: '信念,校准,自省' },
  社会认知偏差: { spirit: '理性思辨与事实尊重', martyr: '方志敏', action: ['对信息来源进行核验再形成判断', '在差异中坚持原则，用证据支持表达'], qualitiesStr: '理性,证据,担当' },
}

function loadDecodeEditor(relief) {
  decodeEditor.reliefId = relief.id
  decodeEditor.type = relief.type
  const tpl = RELIEF_FALLBACK[relief.type] || RELIEF_FALLBACK.学业
  decodeEditor.redSpirit = tpl.spirit || ''
  decodeEditor.martyr = tpl.martyr || ''
  decodeEditor.qualitiesStr = tpl.qualitiesStr || '坚定,理性,自省'
  decodeEditor.actionAdviceStr = (tpl.action || []).join('\n')
}

function clearDecodeEditor() {
  decodeEditor.reliefId = ''
  decodeEditor.type = ''
  decodeEditor.redSpirit = ''
  decodeEditor.martyr = ''
  decodeEditor.qualitiesStr = ''
  decodeEditor.actionAdviceStr = ''
}

async function publishDecode() {
  try {
    const reliefId = decodeEditor.reliefId
    const qualities = decodeEditor.qualitiesStr
      .split(/[，,]/g)
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 3)
    const actionAdvice = decodeEditor.actionAdviceStr
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 6)

    await store.adminPublishRelief({
      reliefId,
      decode: {
        redSpirit: decodeEditor.redSpirit,
        martyr: decodeEditor.martyr,
        qualities,
        actionAdvice,
        expertName: store.curUser?.username || '专家顾问（人工）',
      },
    })
    clearDecodeEditor()
    flashMsg('解读已发布，前台已公开展示')
  } catch (e) {
    flashMsg(e.message || '发布失败', false)
  }
}

// ----- 优质感悟 -----
const reliefReflectionsList = computed(() => store.reliefReflections.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))

async function markQuality(reflectionId) {
  try {
    await store.adminMarkReflectionQuality({ reflectionId })
    flashMsg('已标记为优质感悟')
  } catch (e) {
    flashMsg(e.message || '操作失败', false)
  }
}

function reliefById(reliefId) {
  return store.reliefs.find(r => String(r.id) === String(reliefId)) || null
}

// ----- 评论（原逻辑） -----
const selectedReliefId = ref('')

const reliefOptions = computed(() => {
  return store.reliefs
    .filter(r => store.reliefComments.some(c => String(c.reliefId) === String(r.id)))
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
})

const selectedRelief = computed(() => store.reliefs.find(r => String(r.id) === String(selectedReliefId.value)) || null)
const isAllMode = computed(() => selectedReliefId.value === '__all__')

const commentsForRelief = computed(() => {
  if (isAllMode.value) return []
  return store.reliefComments.filter(c => String(c.reliefId) === String(selectedReliefId.value))
})

const ROOT_KEY = '__root__'

const childrenByParentId = computed(() => {
  const obj = {}
  for (const c of commentsForRelief.value) {
    const pid = c.parentId == null || c.parentId === '' ? ROOT_KEY : String(c.parentId)
    if (!obj[pid]) obj[pid] = []
    obj[pid].push(c)
  }
  for (const key of Object.keys(obj)) {
    obj[key].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }
  const rootsRaw = obj[ROOT_KEY] || []
  const pinned = rootsRaw.filter(x => Boolean(x.pinned)).sort((a, b) => (b.pinnedAt || 0) - (a.pinnedAt || 0))
  const normal = rootsRaw.filter(x => !Boolean(x.pinned)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  obj[ROOT_KEY] = [...pinned, ...normal]
  return obj
})

const rootComments = computed(() => childrenByParentId.value[ROOT_KEY] || [])

function getChildrenByParentId(parentId) {
  return childrenByParentId.value[String(parentId)] || []
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('zh-CN', { hour12: false }).slice(0, 16).replace(/\//g, '-')
}

const allComments = computed(() => store.reliefComments.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))

function isRootComment(c) {
  return c.parentId == null || c.parentId === ''
}

async function toggleTop(c) {
  try {
    await store.adminSetReliefCommentTop({ commentId: c.id, pinned: !c.pinned })
    flashMsg(c.pinned ? '已取消置顶' : '已置顶')
  } catch (e) {
    flashMsg(e?.message || '置顶失败', false)
  }
}

async function deleteComment(c) {
  const ok = confirm('确定删除该评论及其所有回复吗？')
  if (!ok) return
  try {
    await store.adminDeleteReliefComment({ commentId: c.id })
    flashMsg('评论已删除')
  } catch (e) {
    flashMsg(e?.message || '删除失败', false)
  }
}

onMounted(() => {
  if (!selectedReliefId.value && reliefOptions.value.length) selectedReliefId.value = reliefOptions.value[0].id
})

watch(reliefOptions, next => {
  if (!selectedReliefId.value && next.length) selectedReliefId.value = next[0].id
  if (selectedReliefId.value === '__all__') return
  if (selectedReliefId.value && !next.some(r => String(r.id) === String(selectedReliefId.value))) {
    selectedReliefId.value = next[0]?.id || ''
  }
})
</script>
