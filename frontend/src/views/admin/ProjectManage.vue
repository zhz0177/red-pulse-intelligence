<template>
  <div class="flex flex-col md:flex-row gap-4 md:gap-6 min-h-0 md:h-[calc(100vh-128px)]">
    <!-- 左侧: 项目卡片列表 -->
    <aside class="w-full md:w-80 md:flex-shrink-0 max-h-60 md:max-h-none overflow-y-auto">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-bold text-stone-800">项目列表</h3>
        <button @click="showCreateModal = true" class="adm-btn-primary px-3 py-1.5 text-xs">
          + 发布项目
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="relative mb-3">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="adm-input pl-9 pr-3"
          placeholder="搜索项目标题 / 类型..."
        />
      </div>

      <p v-if="!filteredProjects.length" class="text-sm text-stone-400 text-center py-6">无匹配项目</p>

      <div class="space-y-3">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          @click="selectProject(project)"
          :class="[
            'p-4 rounded-xl border cursor-pointer transition-all relative group',
            selectedProject?.id === project.id
              ? 'bg-red-50/60 border-red-800 shadow-md'
              : 'bg-white border-slate-200 hover:shadow-md'
          ]"
        >
          <!-- 删除按钮 -->
          <button
            @click.stop="handleDelete(project)"
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-stone-100 text-stone-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-xs border-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            title="删除项目"
          >✕</button>

          <div class="flex items-center justify-between mb-2">
              <span :class="[
                'text-xs px-2.5 py-1 rounded-full font-semibold border',
              categoryColor[project.category] || 'bg-stone-50 text-stone-700'
            ]">{{ project.category }}</span>
            <span :class="[
                'text-xs px-2.5 py-1 rounded-full font-semibold border',
                project.status === '进行中' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-stone-100 text-stone-500 border-stone-200'
            ]">{{ project.status }}</span>
          </div>
          <h4 class="text-sm font-bold text-stone-800 mb-1 pr-6">{{ project.title }}</h4>
          <div class="flex items-center justify-between text-xs text-stone-400">
            <span>{{ project.submissions.length }} 人已提交</span>
            <span>{{ project.pendingCount }} 待审核</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧: 提交详情 -->
    <div class="flex-1 overflow-y-auto mt-0">
      <template v-if="selectedProject">
        <div class="adm-card p-6 mb-6">
          <div class="adm-card-headerline -mx-6 -mt-6 mb-5"></div>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-red-900 mb-2">{{ selectedProject.title }}</h3>
            <button
              @click="handleDelete(selectedProject)"
              class="adm-btn-secondary px-3 py-1.5 text-xs"
            >删除项目</button>
          </div>
          <p class="text-sm text-stone-600">{{ selectedProject.description }}</p>
        </div>

        <!-- 提交列表 -->
        <div class="space-y-4">
          <div v-for="sub in selectedProject.submissions" :key="sub.id"
            class="adm-card p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-900/10 flex items-center justify-center text-red-900 font-bold">
                  {{ sub.username.charAt(0) }}
                </div>
                <div>
                  <h4 class="text-sm font-bold text-stone-800">{{ sub.username }}</h4>
                  <p class="text-xs text-stone-400">{{ sub.date }}</p>
                </div>
              </div>
              <span :class="[
                'text-xs px-2.5 py-1 rounded-full font-semibold border',
                sub.reviewStatus === '通过' ? 'bg-green-50 text-green-700 border-green-200' :
                sub.reviewStatus === '驳回' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              ]">{{ sub.reviewStatus }}</span>
            </div>

            <!-- 心得 -->
            <div class="bg-stone-50 rounded-lg p-3 mb-3">
              <p class="text-sm text-stone-600 italic">"{{ sub.insight }}"</p>
            </div>

            <!-- 作品预览 -->
            <div v-if="sub.workUrl" class="mb-3">
              <p class="text-xs text-stone-400 mb-1">提交作品:</p>
              <div class="bg-stone-100 rounded-lg p-3 text-sm text-stone-600">
                📎 {{ sub.workUrl }}
              </div>
            </div>

            <!-- 评价 -->
            <div v-if="sub.feedback" class="bg-amber-50 rounded-lg p-3 mb-3">
              <div class="flex items-center gap-1 mb-1">
                <span v-for="s in 5" :key="s" :class="s <= sub.feedback.rating ? 'text-amber-500' : 'text-stone-300'" class="text-sm">★</span>
              </div>
              <p class="text-sm text-amber-800">"{{ sub.feedback.comment }}"</p>
            </div>

            <!-- 审核按钮 -->
            <div v-if="sub.reviewStatus === '待审'" class="flex gap-3 mt-4">
              <button @click="handleReview(sub, '通过')"
                class="adm-btn-primary flex-1 py-2 text-sm">
                审核通过
              </button>
              <button @click="handleReview(sub, '驳回')"
                class="adm-btn-danger flex-1 py-2 text-sm">
                驳回
              </button>
            </div>

            <!-- 证书信息 -->
            <div v-if="sub.reviewStatus === '通过' && sub.certificateCode" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-xs text-green-700">证书已生成 | 溯源码: <strong>{{ sub.certificateCode }}</strong></p>
            </div>

            <!-- 驳回意见 -->
            <div v-if="sub.reviewStatus === '驳回' && sub.rejectReason" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-xs text-red-700"><strong>驳回意见：</strong>{{ sub.rejectReason }}</p>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="flex items-center justify-center h-full text-stone-400">
        <div class="text-center">
          <div class="text-5xl mb-3">📋</div>
          <p>请选择左侧项目查看详情</p>
        </div>
      </div>
    </div>

    <!-- 创建项目弹窗 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-red-900 mb-4">发布新项目</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-stone-600 mb-1">项目标题</label>
            <input v-model="newProject.title" type="text" class="adm-input" placeholder="请输入项目标题" />
          </div>
          <div>
            <label class="block text-sm text-stone-600 mb-1">项目描述</label>
            <textarea v-model="newProject.description" rows="3" class="adm-textarea resize-none" placeholder="请输入项目描述"></textarea>
          </div>
          <div>
            <label class="block text-sm text-stone-600 mb-1">项目类型</label>
            <select v-model="newProject.category" class="adm-select">
              <option value="照片修复">照片修复</option>
              <option value="老兵采访">老兵采访</option>
              <option value="文物保护">文物保护</option>
              <option value="资料整理">资料整理</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showCreateModal = false" class="adm-btn-secondary flex-1">取消</button>
          <button @click="handleCreateProject" class="adm-btn-primary flex-1">发布</button>
        </div>
      </div>
    </div>

    <!-- 驳回意见弹窗 -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showRejectModal = false">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-red-900 mb-4">填写驳回意见</h3>
        <textarea v-model="rejectReason" rows="3" class="adm-textarea resize-none" placeholder="请输入修改意见（志愿者可见）..."></textarea>
        <div class="flex gap-3 mt-4">
          <button @click="showRejectModal = false" class="adm-btn-secondary flex-1">取消</button>
          <button @click="confirmReject" class="adm-btn-danger flex-1">确认驳回</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showDeleteModal = false">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-red-900 mb-2">确认删除</h3>
        <p class="text-sm text-stone-600 mb-1">确定要删除以下项目吗？</p>
        <p class="text-sm font-medium text-stone-800 bg-stone-50 rounded-lg p-3 mb-3">{{ deleteTarget?.title }}</p>
        <p class="text-xs text-red-500 mb-4">该项目下的所有提交记录也将被一并删除，此操作不可撤销。</p>
        <div class="flex gap-3">
          <button @click="showDeleteModal = false" class="adm-btn-secondary flex-1">取消</button>
          <button @click="confirmDelete" class="adm-btn-danger flex-1">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getAdminProjects, reviewSubmission, createProject as apiCreateProject, deleteProject as apiDeleteProject } from '../../api/project'

const selectedProject = ref(null)
const showCreateModal = ref(false)
const showRejectModal = ref(false)
const showDeleteModal = ref(false)
const rejectTarget = ref(null)
const deleteTarget = ref(null)
const rejectReason = ref('')
const searchQuery = ref('')
const newProject = reactive({ title: '', description: '', category: '照片修复' })

const categoryColor = {
  '照片修复': 'bg-red-50 text-red-800 border-red-200',
  '老兵采访': 'bg-rose-50 text-rose-800 border-rose-200',
  '文物保护': 'bg-amber-50 text-amber-800 border-amber-200',
  '资料整理': 'bg-stone-100 text-stone-700 border-stone-200',
}

const projects = ref([])

const filteredProjects = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return projects.value
  return projects.value.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q)
  )
})

function normalizeSub(s) {
  return {
    ...s,
    reviewStatus: s.review_status || s.reviewStatus || '待审',
    certificateCode: s.certificate_code || s.certificateCode || '',
    rejectReason: s.reject_reason || s.rejectReason || '',
    workUrl: s.work_url || s.workUrl || '',
    date: (s.created_at || s.date || '').substring(0, 10),
    feedback: s.feedback || null,
  }
}

onMounted(async () => {
  try {
    const res = await getAdminProjects()
    projects.value = (res.data || []).map(p => {
      const subs = (p.submissions || []).map(normalizeSub)
      return { ...p, pendingCount: p.pendingCount || subs.filter(s => s.reviewStatus === '待审').length, submissions: subs }
    })
  } catch (e) {
    console.warn('加载项目失败', e)
  }
})

function selectProject(project) {
  selectedProject.value = project
}

async function handleReview(submission, status) {
  if (status === '驳回') {
    rejectTarget.value = submission
    rejectReason.value = ''
    showRejectModal.value = true
    return
  }
  try {
    const res = await reviewSubmission({ id: submission.id, status: '通过' })
    submission.reviewStatus = '通过'
    submission.certificateCode = res.data?.certificate_code || ''
    const project = projects.value.find(p => p.submissions.includes(submission))
    if (project) project.pendingCount = Math.max(0, project.pendingCount - 1)
  } catch (e) {
    alert(e.msg || '审核失败')
  }
}

async function confirmReject() {
  const sub = rejectTarget.value
  if (!sub) return
  try {
    await reviewSubmission({ id: sub.id, status: '驳回', reject_reason: rejectReason.value })
    sub.reviewStatus = '驳回'
    sub.rejectReason = rejectReason.value
    const project = projects.value.find(p => p.submissions.includes(sub))
    if (project) project.pendingCount = Math.max(0, project.pendingCount - 1)
    showRejectModal.value = false
  } catch (e) {
    alert(e.msg || '审核失败')
  }
}

function handleDelete(project) {
  deleteTarget.value = project
  showDeleteModal.value = true
}

async function confirmDelete() {
  const p = deleteTarget.value
  if (!p) return
  try {
    await apiDeleteProject(p.id)
    projects.value = projects.value.filter(item => item.id !== p.id)
    if (selectedProject.value?.id === p.id) selectedProject.value = null
    showDeleteModal.value = false
  } catch (e) {
    alert(e.message || '删除失败')
  }
}

async function handleCreateProject() {
  if (!newProject.title.trim()) {
    alert('请输入项目标题')
    return
  }
  try {
    const res = await apiCreateProject({ title: newProject.title, description: newProject.description, category: newProject.category })
    projects.value.unshift({ id: res.data?.id || Date.now(), title: newProject.title, description: newProject.description, category: newProject.category, status: '进行中', pendingCount: 0, submissions: [] })
  } catch {
    projects.value.unshift({ id: Date.now(), title: newProject.title, description: newProject.description, category: newProject.category, status: '进行中', pendingCount: 0, submissions: [] })
  }
  newProject.title = ''
  newProject.description = ''
  newProject.category = '照片修复'
  showCreateModal.value = false
}
</script>
