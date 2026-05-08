<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <button @click="$router.back()" class="mb-4 text-sm text-stone-500 hover:text-red-900 transition bg-transparent border-0 cursor-pointer">
      ← 返回任务列表
    </button>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-20 text-stone-400">加载中...</div>

    <template v-else>
      <!-- 项目详情 -->
      <div class="bg-white rounded-xl shadow-md border border-amber-700/20 overflow-hidden mb-6">
        <div :class="[
          'p-6',
          categoryStyle[project.category]?.bg || 'bg-gradient-to-r from-red-900 to-red-800'
        ]">
          <span class="text-white/70 text-xs bg-white/20 px-2 py-0.5 rounded-full">{{ project.category }}</span>
          <h1 class="text-2xl font-bold text-white mt-2">{{ project.title }}</h1>
          <p class="text-white/80 text-sm mt-2">已有 {{ project.acceptCount }} 人参与</p>
        </div>
        <div class="p-6">
          <p class="text-stone-600 leading-relaxed">{{ project.description }}</p>
          <div class="mt-6 flex gap-3">
            <button v-if="!accepted && !submitted" @click="handleAccept" class="btn-red text-sm">
              接受任务
            </button>
            <span v-else-if="submitted && mySubmission?.review_status === '驳回'" class="text-red-600 font-medium text-sm bg-red-50 px-4 py-2 rounded-lg">
              ✗ 已驳回，请重新提交
            </span>
            <span v-else-if="submitted" class="text-green-600 font-medium text-sm bg-green-50 px-4 py-2 rounded-lg">
              ✓ 已提交成果
            </span>
            <span v-else class="text-green-600 font-medium text-sm bg-green-50 px-4 py-2 rounded-lg">
              ✓ 已接单
            </span>
          </div>
        </div>
      </div>

      <!-- 提交成果 (接单后且未提交时显示) -->
      <div v-if="accepted && !submitted" class="bg-white rounded-xl shadow-md border border-amber-700/20 p-6 mb-6">
        <h3 class="text-lg font-bold text-red-900 mb-4">提交成果</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-stone-600 mb-1">上传成果文件</label>
            <div class="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-red-900 transition cursor-pointer"
                 @click="triggerUpload">
              <input ref="fileInput" type="file" class="hidden" @change="handleFileChange" accept="image/*,.pdf,.doc,.docx" />
              <div v-if="!uploadedFile" class="text-stone-400">
                <div class="text-3xl mb-2">📁</div>
                <p class="text-sm">点击上传修复后的照片或采访文档</p>
                <p class="text-xs mt-1">支持 JPG、PNG、PDF、DOC 格式</p>
              </div>
              <div v-else class="text-green-600">
                <div class="text-3xl mb-2">✓</div>
                <p class="text-sm font-medium">{{ uploadedFile.name }}</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm text-stone-600 mb-1">志愿心得</label>
            <textarea
              v-model="insight"
              rows="4"
              class="w-full border border-stone-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900"
              placeholder="写下你对这次志愿服务的感悟..."
            ></textarea>
          </div>

          <button @click="handleSubmit" :disabled="submitLoading" class="btn-red text-sm disabled:opacity-50">
            {{ submitLoading ? '提交中...' : '提交成果' }}
          </button>
        </div>
      </div>

      <!-- 审核状态 (已提交后显示) -->
      <div v-if="submitted && mySubmission" class="bg-white rounded-xl shadow-md border border-amber-700/20 p-6 mb-6">
        <h3 class="text-lg font-bold text-red-900 mb-3">我的提交</h3>
        <div class="bg-stone-50 rounded-lg p-4 text-sm text-stone-600 space-y-2">
          <p><strong>志愿心得：</strong>{{ mySubmission.insight }}</p>
          <p>
            <strong>审核状态：</strong>
            <span :class="[
              'px-2 py-0.5 rounded-full text-xs',
              mySubmission.review_status === '通过' ? 'bg-green-50 text-green-700' :
              mySubmission.review_status === '驳回' ? 'bg-red-50 text-red-700' :
              'bg-amber-50 text-amber-700'
            ]">{{ mySubmission.review_status }}</span>
          </p>
          <p v-if="mySubmission.reject_reason" class="text-red-600">
            <strong>驳回原因：</strong>{{ mySubmission.reject_reason }}
          </p>
        </div>
        <!-- 驳回后重新提交按钮 -->
        <button
          v-if="mySubmission.review_status === '驳回'"
          @click="handleResubmit"
          class="mt-4 btn-red text-sm"
        >
          重新提交成果
        </button>
      </div>

      <!-- 评价卡片 (提交通过后且未评价时显示) -->
      <div v-if="submitted && !feedbackSubmitted && mySubmission?.review_status === '通过'" class="bg-white rounded-xl shadow-md border border-amber-700/20 p-6 mb-6">
        <h3 class="text-lg font-bold text-red-900 mb-4">评价志愿服务</h3>
        <p class="text-sm text-stone-500 mb-4">请对本次志愿服务体验进行评价</p>

        <!-- 星级评分 -->
        <div class="flex items-center gap-1 mb-4">
          <span class="text-sm text-stone-600 mr-2">评分:</span>
          <button
            v-for="star in 5"
            :key="star"
            @click="rating = star"
            :class="['text-2xl bg-transparent border-0 cursor-pointer transition', star <= rating ? 'text-amber-500' : 'text-stone-300']"
          >★</button>
        </div>

        <textarea
          v-model="feedbackComment"
          rows="3"
          class="w-full border border-stone-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900 mb-3"
          placeholder="写下你对这段志愿服务的感受..."
        ></textarea>

        <button @click="handleFeedback" class="btn-red text-sm">
          提交评价
        </button>
      </div>

      <!-- 证书展示 (审核通过且已评价后显示) -->
      <div v-if="mySubmission?.review_status === '通过' && (feedbackSubmitted || mySubmission?.feedback)" class="flex justify-center mb-6">
        <CertificatePreview :data="certificateData" />
      </div>

      <!-- 已有提交列表 -->
      <div class="bg-white rounded-xl shadow-md border border-amber-700/20 p-6">
        <h3 class="text-lg font-bold text-red-900 mb-4">已提交作品 ({{ submissions.length }})</h3>
        <div v-if="submissions.length" class="space-y-3">
          <div v-for="sub in submissions" :key="sub.id" class="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-red-900/10 flex items-center justify-center text-sm text-red-900 font-bold">
                {{ (sub.username || '?').charAt(0) }}
              </div>
              <div>
                <span class="text-sm font-medium text-stone-800">{{ sub.username }}</span>
                <p class="text-xs text-stone-400 mt-0.5">{{ formatDate(sub.created_at) }}</p>
              </div>
            </div>
            <span :class="[
              'text-xs px-2 py-0.5 rounded-full',
              sub.review_status === '通过' ? 'bg-green-50 text-green-700' :
              sub.review_status === '驳回' ? 'bg-red-50 text-red-700' :
              'bg-amber-50 text-amber-700'
            ]">{{ sub.review_status }}</span>
          </div>
        </div>
        <p v-else class="text-stone-400 text-sm text-center py-4">暂无提交</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProject, getSubmissions, submitWork, submitFeedback } from '../../api/project'
import CertificatePreview from '../../components/CertificatePreview.vue'
import { useShopStore } from '../../stores/shop'

const route = useRoute()
const projectId = computed(() => Number(route.params.projectId))
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
const shopStore = useShopStore()

const project = ref({ id: 0, title: '', description: '', category: '照片修复', acceptCount: 0 })
const submissions = ref([])
const mySubmission = ref(null)
const accepted = ref(false)
const submitted = ref(false)
const feedbackSubmitted = ref(false)
const submitLoading = ref(false)
const uploadedFile = ref(null)
const insight = ref('')
const rating = ref(5)
const feedbackComment = ref('')
const fileInput = ref(null)
const loading = ref(true)

const categoryStyle = {
  '照片修复': { bg: 'bg-gradient-to-r from-amber-700 to-amber-600' },
  '老兵采访': { bg: 'bg-gradient-to-r from-red-900 to-red-800' },
  '文物保护': { bg: 'bg-gradient-to-r from-emerald-800 to-emerald-700' },
  '资料整理': { bg: 'bg-gradient-to-r from-sky-800 to-sky-700' },
}

const certificateData = computed(() => ({
  username: currentUser.username || '志愿者',
  projectTitle: project.value.title,
  hours: 8,
  certificateCode: mySubmission.value?.certificate_code || '',
  date: mySubmission.value?.created_at ? formatDate(mySubmission.value.created_at) : new Date().toLocaleDateString('zh-CN'),
}))

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.substring(0, 10)
}

function triggerUpload() { fileInput.value?.click() }
function handleFileChange(e) { uploadedFile.value = e.target.files[0] }

// 接受任务 (UI 切换，显示提交表单)
function handleAccept() {
  accepted.value = true
}

// 驳回后重新提交 → 重置表单，显示提交区域
function handleResubmit() {
  submitted.value = false
  accepted.value = true
  insight.value = ''
  uploadedFile.value = null
  feedbackSubmitted.value = false
}

// 提交成果 → 调用真实 API
async function handleSubmit() {
  if (!insight.value.trim()) {
    alert('请填写志愿心得')
    return
  }
  submitLoading.value = true
  try {
    const res = await submitWork({
      project_id: projectId.value,
      insight: insight.value.trim(),
      work_url: uploadedFile.value ? uploadedFile.value.name : ''
    })
    submitted.value = true
    mySubmission.value = { id: res.data?.id, insight: insight.value.trim(), review_status: '待审' }

    // 接单平台 → 完成接单：+30 传承豆（按项目去重）
    const awardKey = `beans-awarded-volunteer-${currentUser.id}-${projectId.value}`
    if (!localStorage.getItem(awardKey)) {
      localStorage.setItem(awardKey, '1')
      try { await shopStore.earn('volunteer_complete') } catch {}
    }

    // 刷新提交列表和项目数据
    const [subsRes, projRes] = await Promise.all([
      getSubmissions(projectId.value),
      getProject(projectId.value)
    ])
    submissions.value = subsRes.data || submissions.value
    project.value = projRes.data || project.value

    // 重新查找自己的提交（获取完整字段）
    const mySub = submissions.value.find(s => Number(s.user_id) === Number(currentUser.id))
    if (mySub) mySubmission.value = mySub
  } catch (e) {
    alert(e.message || '提交失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 提交评价 → 调用真实 API
async function handleFeedback() {
  if (!mySubmission.value?.id) return
  try {
    await submitFeedback({
      submission_id: mySubmission.value.id,
      rating: rating.value,
      comment: feedbackComment.value.trim()
    })
    feedbackSubmitted.value = true
  } catch (e) {
    alert(e.message || '评价失败，请重试')
  }
}

onMounted(async () => {
  try {
    const [projRes, subsRes] = await Promise.all([
      getProject(projectId.value),
      getSubmissions(projectId.value)
    ])
    project.value = projRes.data || project.value
    submissions.value = subsRes.data || []

    // 检查当前用户是否已提交过
    if (currentUser.id) {
      const mySub = submissions.value.find(s => Number(s.user_id) === Number(currentUser.id))
      if (mySub) {
        accepted.value = true
        submitted.value = true
        mySubmission.value = mySub
        if (mySub.feedback) {
          feedbackSubmitted.value = true
        }
      }
    }
  } catch (e) {
    console.error('加载项目失败:', e)
  } finally {
    loading.value = false
  }
})
</script>
