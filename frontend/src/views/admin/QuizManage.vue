<template>
  <div>
    <!-- 标签页切换 -->
    <div class="flex items-center gap-4 mb-4 border-b border-stone-200">
      <button
        @click="activeTab = 'questions'"
        :class="['px-4 py-2 text-sm font-medium border-b-2 transition bg-transparent cursor-pointer',
          activeTab === 'questions' ? 'border-red-900 text-red-900' : 'border-transparent text-stone-500 hover:text-stone-700']"
      >题库管理</button>
      <button
        @click="activeTab = 'leaderboard'"
        :class="['px-4 py-2 text-sm font-medium border-b-2 transition bg-transparent cursor-pointer',
          activeTab === 'leaderboard' ? 'border-red-900 text-red-900' : 'border-transparent text-stone-500 hover:text-stone-700']"
      >排行榜</button>
    </div>

    <!-- ====== 题库管理 Tab ====== -->
    <template v-if="activeTab === 'questions'">
      <!-- 顶部操作栏 -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <span class="text-sm text-stone-500">共 <strong>{{ questions.length }}</strong> 道题</span>
          <select v-model="filterCategory" class="adm-select w-44 py-1.5">
            <option value="">全部分类</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <button @click="openCreate" class="adm-btn-primary">
          + 新增题目
        </button>
      </div>

      <!-- 题目列表 -->
      <div class="space-y-3">
        <div
          v-for="q in filteredQuestions"
          :key="q.id"
          class="adm-card p-4 hover:shadow-md transition"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="adm-badge adm-badge-admin">{{ q.category }}</span>
                <span class="adm-badge adm-badge-success">答案: {{ q.answer }}</span>
                <span class="text-xs text-stone-400">#{{ q.id }}</span>
              </div>
              <p class="text-sm text-stone-800 font-medium mb-2">{{ q.question }}</p>
              <div class="grid grid-cols-2 gap-1 text-xs text-stone-500">
                <span :class="q.answer === 'A' ? 'text-red-800 font-bold' : ''">A. {{ q.option_a }}</span>
                <span :class="q.answer === 'B' ? 'text-red-800 font-bold' : ''">B. {{ q.option_b }}</span>
                <span :class="q.answer === 'C' ? 'text-red-800 font-bold' : ''">C. {{ q.option_c }}</span>
                <span :class="q.answer === 'D' ? 'text-red-800 font-bold' : ''">D. {{ q.option_d }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button @click="openEdit(q)" class="adm-btn-secondary px-3 py-1.5 text-xs">编辑</button>
              <button @click="handleDelete(q.id)" class="adm-btn-danger px-3 py-1.5 text-xs">删除</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!filteredQuestions.length" class="text-center py-12 text-stone-400">
        {{ loading ? '加载中...' : '暂无题目' }}
      </div>
    </template>

    <!-- ====== 排行榜 Tab ====== -->
    <template v-if="activeTab === 'leaderboard'">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm text-stone-500">共 <strong>{{ leaderboard.length }}</strong> 条成绩记录</span>
      </div>

      <div v-if="leaderboardLoading" class="text-center py-12 text-stone-400">加载中...</div>
      <div v-else-if="!leaderboard.length" class="text-center py-12 text-stone-400">暂无成绩记录</div>
      <div v-else class="space-y-2">
        <div
          v-for="(item, idx) in leaderboard"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-3 adm-card hover:shadow-md transition"
        >
          <div class="w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0"
            :class="idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-stone-300 text-white' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'"
          >
            {{ idx + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-stone-800">{{ item.username }}</div>
            <div class="text-xs text-stone-400">{{ formatTime(item.created_at) }}</div>
          </div>
          <div class="text-right flex-shrink-0 mr-4">
            <div class="text-lg font-bold text-red-900">{{ item.streak }}</div>
            <div class="text-xs text-stone-400">连对</div>
          </div>
          <button
            @click="handleDeleteScore(item.id, item.username)"
            class="adm-btn-danger px-3 py-1.5 text-xs flex-shrink-0"
          >删除</button>
        </div>
      </div>
    </template>

    <!-- 编辑/新增弹窗 -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="bg-gradient-to-r from-red-900 to-red-800 text-white p-5 rounded-t-2xl flex items-center justify-between">
          <h3 class="font-bold">{{ editId ? '编辑题目' : '新增题目' }}</h3>
          <button @click="showModal = false" class="text-white/80 hover:text-white bg-transparent border-0 text-xl cursor-pointer">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">题干 *</label>
            <textarea v-model="form.question" rows="3" class="adm-textarea resize-none" placeholder="输入题目内容"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="opt in ['A','B','C','D']" :key="opt">
              <label class="block text-xs font-medium text-stone-500 mb-1">选项 {{ opt }} *</label>
              <input v-model="form['option_' + opt.toLowerCase()]" class="adm-input" :placeholder="'选项' + opt" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">正确答案 *</label>
              <select v-model="form.answer" class="adm-select">
                <option value="">请选择</option>
                <option v-for="o in ['A','B','C','D']" :key="o" :value="o">{{ o }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">题目分类</label>
              <input v-model="form.category" class="adm-input" placeholder="如: 革命先烈、党史知识" />
            </div>
          </div>
          <div v-if="formError" class="text-sm text-red-600">{{ formError }}</div>
          <div class="flex justify-end gap-3 pt-2">
            <button @click="showModal = false" class="adm-btn-secondary">取消</button>
            <button @click="handleSubmit" :disabled="submitting" class="adm-btn-primary disabled:opacity-50">
              {{ submitting ? '提交中...' : (editId ? '保存修改' : '创建题目') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, getAdminLeaderboard, deleteScore } from '../../api/quiz'

const activeTab = ref('questions')

// ====== 题库管理相关 ======
const questions = ref([])
const loading = ref(true)
const filterCategory = ref('')
const showModal = ref(false)
const editId = ref(null)
const submitting = ref(false)
const formError = ref('')

const emptyForm = () => ({
  question: '', option_a: '', option_b: '', option_c: '', option_d: '',
  answer: '', category: '红色历史'
})
const form = ref(emptyForm())

const categories = computed(() => {
  const set = new Set(questions.value.map(q => q.category).filter(Boolean))
  return [...set]
})

const filteredQuestions = computed(() => {
  if (!filterCategory.value) return questions.value
  return questions.value.filter(q => q.category === filterCategory.value)
})

async function fetchQuestions() {
  loading.value = true
  try {
    const res = await getQuestions()
    questions.value = res.data || []
  } catch { questions.value = [] }
  loading.value = false
}

function openCreate() {
  editId.value = null
  form.value = emptyForm()
  formError.value = ''
  showModal.value = true
}

function openEdit(q) {
  editId.value = q.id
  form.value = {
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    answer: q.answer,
    category: q.category || '红色历史'
  }
  formError.value = ''
  showModal.value = true
}

async function handleSubmit() {
  const f = form.value
  if (!f.question || !f.option_a || !f.option_b || !f.option_c || !f.option_d) {
    formError.value = '题干和所有选项不能为空'
    return
  }
  if (!['A','B','C','D'].includes(f.answer)) {
    formError.value = '请选择正确答案'
    return
  }
  formError.value = ''
  submitting.value = true
  try {
    if (editId.value) {
      await updateQuestion({ id: editId.value, ...f })
    } else {
      await createQuestion(f)
    }
    showModal.value = false
    await fetchQuestions()
  } catch (err) {
    formError.value = err.message || '操作失败'
  }
  submitting.value = false
}

async function handleDelete(id) {
  if (!confirm('确定删除此题目？')) return
  try {
    await deleteQuestion(id)
    await fetchQuestions()
  } catch { /* ignore */ }
}

// ====== 排行榜相关 ======
const leaderboard = ref([])
const leaderboardLoading = ref(false)

async function fetchLeaderboard() {
  leaderboardLoading.value = true
  try {
    const res = await getAdminLeaderboard()
    leaderboard.value = res.data || []
  } catch { leaderboard.value = [] }
  leaderboardLoading.value = false
}

async function handleDeleteScore(id, username) {
  if (!confirm(`确定删除用户「${username}」的成绩记录？`)) return
  try {
    await deleteScore(id)
    await fetchLeaderboard()
  } catch { /* ignore */ }
}

function formatTime(dt) {
  if (!dt) return ''
  return dt.replace('T', ' ').substring(0, 16)
}

// 切换到排行榜 tab 时自动加载数据
watch(activeTab, (val) => {
  if (val === 'leaderboard' && !leaderboard.value.length) {
    fetchLeaderboard()
  }
})

onMounted(fetchQuestions)
</script>
