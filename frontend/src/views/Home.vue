<template>
  <div class="relative min-h-[calc(100vh-64px)] overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 bg-gradient-to-b from-stone-100 via-red-50/30 to-stone-100 pointer-events-none"></div>
    <div class="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><text x=%2210%22 y=%2250%22 font-size=%2240%22 fill=%22%23991b1b%22 opacity=%220.3%22>忠</text></svg>'); background-size: 100px 100px;"></div>

    <!-- 主内容 -->
    <div class="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-14">
      <!-- 顶部装饰线 -->
      <div class="flex items-center justify-center gap-4 mb-6">
        <div class="h-px w-16 md:w-20 bg-gradient-to-r from-transparent to-amber-700"></div>
        <span class="text-amber-700 text-xs md:text-sm tracking-[0.5em]">青年红色筑梦之旅</span>
        <div class="h-px w-16 md:w-20 bg-gradient-to-l from-transparent to-amber-700"></div>
      </div>

      <!-- 标题区域 -->
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-6xl font-bold text-red-900 mb-3 tracking-wider" style="font-family: 'SimHei', sans-serif">
          红脉智联
        </h1>
        <p class="text-base md:text-xl text-stone-600 mb-2">传承红色基因 · 赓续精神血脉</p>
        <p class="text-sm text-stone-400 max-w-2xl mx-auto leading-relaxed mt-3">
          以数字化手段连接红色记忆，通过交互地图追寻先烈足迹，以家书传递跨越时空的信念，
          让当代青年在志愿服务中感悟革命精神，在实践中传承红色文化。
        </p>
      </div>

      <!-- 核心入口按钮 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        <router-link to="/map" class="group no-underline">
          <div class="h-40 md:h-44 bg-white rounded-2xl shadow-lg border-2 border-amber-700/30 hover:border-red-900 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center gap-3 cursor-pointer group-hover:-translate-y-2">
            <div class="w-14 h-14 bg-red-900/10 rounded-full flex items-center justify-center text-3xl group-hover:bg-red-900/20 transition">
              🗺️
            </div>
            <div class="text-center">
              <h3 class="text-lg font-bold text-red-900 mb-1">红迹地图入口</h3>
              <p class="text-xs text-stone-500">探寻先烈足迹 · 阅读家书 · 铭记历史</p>
            </div>
          </div>
        </router-link>

        <router-link to="/game" class="group no-underline">
          <div class="h-40 md:h-44 bg-white rounded-2xl shadow-lg border-2 border-amber-700/30 hover:border-red-900 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center gap-3 cursor-pointer group-hover:-translate-y-2">
            <div class="w-14 h-14 bg-red-900/10 rounded-full flex items-center justify-center text-3xl group-hover:bg-red-900/20 transition">
              🏆
            </div>
            <div class="text-center">
              <h3 class="text-lg font-bold text-red-900 mb-1">红色知识大闯关</h3>
              <p class="text-xs text-stone-500">知识竞答 · 记忆翻牌 · 挑战排行</p>
            </div>
          </div>
        </router-link>

        <router-link to="/volunteer" class="group no-underline">
          <div class="h-40 md:h-44 bg-white rounded-2xl shadow-lg border-2 border-amber-700/30 hover:border-red-900 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center gap-3 cursor-pointer group-hover:-translate-y-2">
            <div class="w-14 h-14 bg-red-900/10 rounded-full flex items-center justify-center text-3xl group-hover:bg-red-900/20 transition">
              🤝
            </div>
            <div class="text-center">
              <h3 class="text-lg font-bold text-red-900 mb-1">志愿者接单中心</h3>
              <p class="text-xs text-stone-500">修复照片 · 采访老兵 · 传承记忆</p>
            </div>
          </div>
        </router-link>

        <!-- 思政成长馆 -->
        <router-link to="/ideology" class="group no-underline">
          <div class="h-40 md:h-44 bg-white rounded-2xl shadow-lg border-2 border-amber-700/30 hover:border-red-900 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center gap-3 cursor-pointer group-hover:-translate-y-2">
            <div class="w-14 h-14 bg-red-900/10 rounded-full flex items-center justify-center text-3xl group-hover:bg-red-900/20 transition">
              🗣️
            </div>
            <div class="text-center">
              <h3 class="text-lg font-bold text-red-900 mb-1">红色精神成长馆</h3>
              <p class="text-xs text-stone-500">思思政辩论 · 解忧落地 · 积分成长</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 数据展示 -->
      <div class="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-10">
        <div class="text-center bg-white/60 rounded-xl py-4 px-2 border border-amber-700/10">
          <div class="text-xl md:text-3xl font-bold text-red-900">{{ stats.martyrs }}</div>
          <div class="text-xs md:text-sm text-stone-500 mt-1">红色坐标点</div>
        </div>
        <div class="text-center bg-white/60 rounded-xl py-4 px-2 border border-amber-700/10">
          <div class="text-xl md:text-3xl font-bold text-red-900">{{ stats.volunteers }}</div>
          <div class="text-xs md:text-sm text-stone-500 mt-1">注册志愿者</div>
        </div>
        <div class="text-center bg-white/60 rounded-xl py-4 px-2 border border-amber-700/10">
          <div class="text-xl md:text-3xl font-bold text-red-900">{{ stats.photos }}</div>
          <div class="text-xs md:text-sm text-stone-500 mt-1">照片已修复</div>
        </div>
      </div>

      <!-- 英雄风采 -->
      <div class="mb-10">
        <div class="flex items-center justify-center gap-3 mb-6">
          <div class="h-px w-12 bg-red-900/20"></div>
          <h2 class="text-lg md:text-xl font-bold text-red-900 tracking-wider">英雄风采</h2>
          <div class="h-px w-12 bg-red-900/20"></div>
        </div>

        <!-- 英雄卡片网格 + 背景连线 -->
        <div class="hero-grid-wrap relative">
          <!-- 背景连线装饰 SVG -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none">
            <defs>
              <pattern id="heroGridLines" width="100%" height="100%" patternUnits="objectBoundingBox">
                <line x1="0%" y1="25%" x2="100%" y2="75%" stroke="#991b1b" stroke-width="0.5" opacity="0.06" stroke-dasharray="8 6"/>
                <line x1="100%" y1="20%" x2="0%" y2="80%" stroke="#b45309" stroke-width="0.5" opacity="0.05" stroke-dasharray="6 8"/>
                <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#991b1b" stroke-width="0.4" opacity="0.04" stroke-dasharray="4 10"/>
                <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#b45309" stroke-width="0.4" opacity="0.04" stroke-dasharray="4 10"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGridLines)"/>
            <!-- 对角交叉线 -->
            <line x1="10%" y1="0" x2="90%" y2="100%" stroke="#991b1b" stroke-width="0.6" opacity="0.05" stroke-dasharray="12 8"/>
            <line x1="90%" y1="0" x2="10%" y2="100%" stroke="#b45309" stroke-width="0.6" opacity="0.05" stroke-dasharray="12 8"/>
            <line x1="30%" y1="0" x2="70%" y2="100%" stroke="#991b1b" stroke-width="0.4" opacity="0.04" stroke-dasharray="6 12"/>
            <line x1="70%" y1="0" x2="30%" y2="100%" stroke="#b45309" stroke-width="0.4" opacity="0.04" stroke-dasharray="6 12"/>
          </svg>

          <!-- 卡片网格 -->
          <div class="relative z-10 grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            <HeroCard
              v-for="m in featuredMartyrs"
              :key="m.id"
              :martyr="m"
            />
          </div>
        </div>

        <div class="text-center mt-5">
          <router-link to="/map" class="text-sm text-red-900 hover:text-red-700 transition no-underline font-medium">
            查看全部 {{ stats.martyrs }} 位先烈 →
          </router-link>
        </div>
      </div>

      <!-- 志愿服务精选 -->
      <div class="mb-10">
        <div class="flex items-center justify-center gap-3 mb-6">
          <div class="h-px w-12 bg-red-900/20"></div>
          <h2 class="text-lg md:text-xl font-bold text-red-900 tracking-wider">志愿服务精选</h2>
          <div class="h-px w-12 bg-red-900/20"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <router-link
            v-for="p in featuredProjects"
            :key="p.id"
            :to="`/volunteer/${p.id}`"
            class="no-underline"
          >
            <div class="bg-white rounded-xl border border-amber-700/20 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div :class="['px-4 py-3 text-white text-sm font-medium', categoryBg[p.category] || 'bg-red-900']">
                <span class="inline-block w-5 text-center text-base leading-none align-middle">{{ categoryIcon[p.category] || '📋' }}</span> {{ p.category }}
              </div>
              <div class="p-4">
                <h4 class="text-sm font-bold text-stone-800 mb-2">{{ p.title }}</h4>
                <p class="text-xs text-stone-400 line-clamp-2 mb-3">{{ p.description }}</p>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-stone-400">已有 <strong class="text-red-900">{{ p.acceptCount }}</strong> 人参与</span>
                  <span :class="['px-2 py-0.5 rounded-full', p.status === '进行中' ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500']">{{ p.status }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
        <div class="text-center mt-4">
          <router-link to="/volunteer" class="text-sm text-red-900 hover:text-red-700 transition no-underline font-medium">
            查看全部志愿项目 →
          </router-link>
        </div>
      </div>

      <!-- 底部装饰 -->
      <div class="flex items-center justify-center gap-4">
        <div class="h-px w-24 md:w-32 bg-gradient-to-r from-transparent to-red-900/20"></div>
        <span class="text-red-900/40 text-xs tracking-widest">铭记历史 · 不忘初心</span>
        <div class="h-px w-24 md:w-32 bg-gradient-to-l from-transparent to-red-900/20"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useMartyrStore } from '../stores/martyr'
import { getStats } from '../api/project'
import { getProjects } from '../api/project'
import { getFeaturedMartyrs as apiFeatured } from '../api/martyr'
import HeroCard from '../components/HeroCard.vue'

const martyrStore = useMartyrStore()
const featuredMartyrs = ref([])
const featuredProjects = ref([])

const stats = reactive({
  martyrs: 0,
  volunteers: 0,
  photos: 0,
})

const categoryIcon = { '照片修复': '🖼️', '老兵采访': '🎙️', '文物保护': '🏛️', '资料整理': '📚' }
const categoryBg = { '照片修复': 'bg-amber-700', '老兵采访': 'bg-blue-800', '文物保护': 'bg-emerald-800', '资料整理': 'bg-sky-800' }

onMounted(async () => {
  // 获取真实统计数据
  try {
    const res = await getStats()
    stats.martyrs = res.data?.martyrs || 0
    stats.volunteers = res.data?.volunteers || 0
    stats.photos = res.data?.photos || 0
  } catch {
    // 接口失败时不再使用硬编码，保持 0
  }

  // 获取英雄展示数据（优先用 featured 接口，回退到 martyr store）
  try {
    const res = await apiFeatured()
    featuredMartyrs.value = (res.data || []).slice(0, 12)
  } catch {
    try {
      if (!martyrStore.martyrs.length) {
        await martyrStore.fetchMartyrs()
      }
      featuredMartyrs.value = martyrStore.martyrs.slice(0, 12)
    } catch {
      featuredMartyrs.value = []
    }
  }

  // 获取志愿项目（取6个展示）
  try {
    const res = await getProjects()
    featuredProjects.value = (res.data || []).slice(0, 6)
  } catch {
    featuredProjects.value = []
  }
})
</script>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
