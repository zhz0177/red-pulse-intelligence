<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-red-900 mb-2">志愿者接单中心</h1>
      <p class="text-stone-500 text-sm">传承红色记忆，贡献青春力量</p>
    </div>

    <!-- 分类筛选 -->
    <div class="flex items-center justify-center gap-3 mb-8 flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat.value"
        @click="currentCategory = cat.value"
        :class="[
          'px-4 py-2 rounded-full text-sm transition border cursor-pointer',
          currentCategory === cat.value
            ? 'bg-red-900 text-white border-red-900'
            : 'bg-white text-stone-600 border-stone-300 hover:border-red-900 hover:text-red-900'
        ]"
      >{{ cat.label }}</button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-16 text-stone-400">加载中...</div>

    <!-- 任务卡片列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="bg-white rounded-xl shadow-md border border-amber-700/20 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      >
        <!-- 卡片头部 -->
        <div :class="[
          'p-4',
          categoryStyle[project.category]?.bg || 'bg-gradient-to-r from-red-900 to-red-800'
        ]">
          <div class="flex items-center justify-between text-white">
            <span class="text-lg">{{ categoryStyle[project.category]?.icon || '📋' }}</span>
            <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full">{{ project.category }}</span>
          </div>
          <h3 class="text-white font-bold mt-2">{{ project.title }}</h3>
        </div>
        <!-- 卡片内容 -->
        <div class="p-4">
          <p class="text-sm text-stone-600 mb-4 line-clamp-2">{{ project.description }}</p>
          <div class="flex items-center justify-between text-xs text-stone-400 mb-4">
            <span>已有 <strong class="text-red-900">{{ project.acceptCount }}</strong> 人接单</span>
            <span :class="[
              'px-2 py-0.5 rounded-full',
              project.status === '进行中' ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'
            ]">{{ project.status }}</span>
          </div>
          <router-link
            :to="`/volunteer/${project.id}`"
            class="block w-full text-center btn-red text-sm no-underline"
          >
            查看详情 / 接单
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="!loading && !filteredProjects.length" class="text-center py-16">
      <div class="text-5xl mb-4">📋</div>
      <p class="text-stone-400">暂无志愿任务</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProjects } from '../../api/project'

const currentCategory = ref('all')
const loading = ref(true)
const projects = ref([])

const categories = [
  { label: '全部', value: 'all' },
  { label: '照片修复', value: '照片修复' },
  { label: '老兵采访', value: '老兵采访' },
  { label: '文物保护', value: '文物保护' },
  { label: '资料整理', value: '资料整理' },
]

const categoryStyle = {
  '照片修复': { bg: 'bg-gradient-to-r from-amber-700 to-amber-600', icon: '🖼️' },
  '老兵采访': { bg: 'bg-gradient-to-r from-red-900 to-red-800', icon: '🎙️' },
  '文物保护': { bg: 'bg-gradient-to-r from-emerald-800 to-emerald-700', icon: '🏛️' },
  '资料整理': { bg: 'bg-gradient-to-r from-sky-800 to-sky-700', icon: '📚' },
}

const filteredProjects = computed(() => {
  if (currentCategory.value === 'all') return projects.value
  return projects.value.filter(p => p.category === currentCategory.value)
})

onMounted(async () => {
  try {
    const res = await getProjects()
    projects.value = res.data || []
  } catch (e) {
    console.error('加载项目失败:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
