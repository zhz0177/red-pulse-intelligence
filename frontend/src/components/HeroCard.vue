<template>
  <div
    class="hero-card-wrap relative"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- 基础卡片 -->
    <div class="hero-card bg-gradient-to-b from-white to-stone-50 rounded-xl border-2 border-amber-700/25 p-3 md:p-4 text-center cursor-pointer transition-all duration-300 hover:border-red-900/60 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
      <!-- 复古纹理装饰 -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2220%22 height=%2220%22 fill=%22none%22 stroke=%22%23991b1b%22 stroke-width=%220.5%22 opacity=%220.3%22/></svg>');"></div>
      <!-- 头像 -->
      <div class="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-full bg-red-900/10 border-2 border-amber-700/30 flex items-center justify-center text-red-900 font-bold text-xl md:text-2xl mb-2 transition-all duration-300" :class="hovered ? 'bg-red-900 text-white border-red-900 scale-110' : ''">
        {{ martyr.name?.charAt(0) }}
      </div>
      <!-- 姓名 -->
      <h4 class="text-sm md:text-base font-bold text-stone-800 mb-0.5" style="font-family: 'SimHei', sans-serif">{{ martyr.name }}</h4>
      <p class="text-[10px] text-stone-400 truncate">{{ martyr.tracks || shortRoute }}</p>
    </div>

    <!-- Hover 弹窗 -->
    <transition name="popover">
      <div
        v-if="hovered"
        class="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 md:w-80 rounded-xl shadow-2xl border border-amber-700/30 overflow-hidden pointer-events-auto"
        style="backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); background: rgba(255,255,255,0.88);"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
      >
        <!-- 顶部色条 -->
        <div class="h-1.5 bg-gradient-to-r from-red-900 via-amber-700 to-red-900"></div>

        <div class="p-4 flex gap-3">
          <!-- 左侧：微缩路径图 -->
          <div class="flex-shrink-0 w-[140px] bg-stone-50 rounded-lg border border-stone-200 p-1 flex items-center justify-center">
            <MiniRouteMap
              v-if="martyr.route?.length >= 2"
              :route="martyr.route"
              :routeLabels="martyr.routeLabels"
              :width="130"
              :height="85"
            />
            <span v-else class="text-xs text-stone-300">暂无轨迹</span>
          </div>

          <!-- 右侧：简介 -->
          <div class="flex-1 min-w-0 flex flex-col">
            <h5 class="text-sm font-bold text-red-900 mb-1.5" style="font-family: 'SimHei', sans-serif">{{ martyr.name }}</h5>
            <p class="text-xs text-stone-600 leading-relaxed flex-1">{{ bioSummary }}</p>

            <!-- 信封按钮 -->
            <div class="flex justify-end mt-2">
              <button
                @click.stop="goLetter"
                class="envelope-btn group/env relative w-10 h-8 cursor-pointer bg-transparent border-0 p-0"
                title="阅读家书"
              >
                <!-- 信封 SVG -->
                <svg viewBox="0 0 40 32" class="w-full h-full drop-shadow-sm">
                  <!-- 信封主体 -->
                  <rect x="1" y="6" width="38" height="24" rx="3" fill="#f5e6d0" stroke="#b45309" stroke-width="1.2"/>
                  <!-- 信封盖 -->
                  <path d="M1 9 L20 22 L39 9" fill="none" stroke="#b45309" stroke-width="1" opacity="0.5"/>
                  <!-- 封口三角 -->
                  <path d="M1 6 L20 18 L39 6" fill="#f0d9b5" stroke="#b45309" stroke-width="1.2" stroke-linejoin="round"/>
                  <!-- 蜡封 -->
                  <circle cx="20" cy="20" r="5" fill="#7f1d1d" opacity="0.85"/>
                  <text x="20" y="23" text-anchor="middle" fill="white" font-size="7" font-weight="bold">书</text>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MiniRouteMap from './MiniRouteMap.vue'

const props = defineProps({
  martyr: { type: Object, required: true },
})

const router = useRouter()
const hovered = ref(false)

const bioSummary = computed(() => {
  const bio = props.martyr.bio || ''
  return bio.length > 60 ? bio.substring(0, 60) + '...' : bio
})

const shortRoute = computed(() => {
  const labels = props.martyr.routeLabels || []
  if (labels.length >= 2) return labels[0] + ' → ' + labels[labels.length - 1]
  return ''
})

function goLetter() {
  router.push('/letter/' + props.martyr.id)
}
</script>

<style scoped>
.popover-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.popover-leave-active {
  transition: all 0.15s ease-in;
}
.popover-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
.popover-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

.envelope-btn:hover svg {
  filter: drop-shadow(0 2px 4px rgba(127,29,29,0.3));
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
.envelope-btn svg {
  transition: all 0.2s ease;
}
</style>
