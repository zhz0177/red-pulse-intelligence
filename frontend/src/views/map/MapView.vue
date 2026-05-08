<template>
  <div class="h-[calc(100vh-64px)] flex">
    <!-- 遮罩层 (手机端) -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-20 md:hidden" @click="sidebarOpen = false"></div>

    <!-- 左侧人物导航栏 -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-lg border-r border-amber-700/20 flex flex-col overflow-hidden transform transition-transform duration-300',
      'md:static md:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
      <div class="p-4 bg-red-900 text-white flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold tracking-wider">先烈名录</h3>
          <p class="text-xs text-white/60 mt-1">点击人物跳转至红色坐标</p>
        </div>
        <button @click="sidebarOpen = false" class="md:hidden bg-transparent border-0 text-white text-lg cursor-pointer">✕</button>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="martyr in martyrStore.martyrs"
          :key="martyr.id"
          @click="handleSelectMartyr(martyr)"
          :class="[
            'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-stone-100',
            selectedId === martyr.id ? 'bg-red-50 border-l-4 border-l-red-900' : 'hover:bg-stone-50'
          ]"
        >
          <div class="w-10 h-10 rounded-full bg-red-900/10 flex items-center justify-center text-red-900 font-bold text-sm flex-shrink-0">
            {{ martyr.name.charAt(0) }}
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-stone-800 truncate">{{ martyr.name }}</div>
            <div class="text-xs text-stone-400 truncate">{{ martyr.bio?.substring(0, 20) }}...</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧地图 -->
    <div class="flex-1 relative">
      <div id="map-container" class="w-full h-full"></div>

      <div v-if="mapLoading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
        <div class="text-center">
          <div class="text-3xl mb-2 animate-pulse">🗺️</div>
          <p class="text-stone-500 text-sm">地图加载中...</p>
        </div>
      </div>

      <!-- 人物列表按钮 (手机端) -->
      <button @click="sidebarOpen = true" class="md:hidden absolute top-3 left-3 z-10 bg-white/95 shadow-lg border border-amber-700/20 rounded-lg px-3 py-2 text-sm font-medium text-red-900 cursor-pointer">
        ☰ 先烈名录
      </button>

      <!-- 图例 -->
      <div class="absolute bottom-14 md:bottom-6 left-3 md:left-6 bg-white/95 rounded-lg shadow-lg border border-amber-700/20 p-2 md:p-3 z-10 text-xs">
        <div class="font-bold text-red-900 mb-1">图例</div>
        <div class="text-stone-400 text-[10px] mb-2">点击人物查看详细足迹</div>
        <div class="flex items-center gap-2 mb-1"><span class="inline-block w-3 h-3 rounded-full bg-green-600 border border-green-800"></span>出生地</div>
        <div class="flex items-center gap-2 mb-1"><span class="inline-block w-3 h-3 rounded-full bg-amber-600 border border-amber-800"></span>途经地</div>
        <div class="flex items-center gap-2 mb-1"><span class="inline-block w-3 h-3 rounded-sm bg-red-800 border border-red-900"></span>牺牲地</div>
        <div class="flex items-center gap-2"><span class="inline-block w-6 h-0.5 bg-red-800" style="border-bottom:2px dashed #991b1b"></span>足迹路线</div>
      </div>

      <!-- 路线切换按钮 -->
      <div class="absolute bottom-14 md:bottom-6 right-3 md:right-6 z-10">
        <button
          @click="toggleAllRoutes"
          :class="['px-3 md:px-4 py-2 rounded-lg text-sm font-medium shadow-lg border transition cursor-pointer',
            showAllRoutes ? 'bg-red-900 text-white border-red-900 hover:bg-red-800' : 'bg-white/95 text-stone-600 border-amber-700/20 hover:bg-red-50 hover:text-red-900']"
        >
          {{ showAllRoutes ? '隐藏全部路线' : '查看全部路线' }}
        </button>
      </div>

      <!-- 人物信息面板 -->
      <transition name="slide">
        <div v-if="showPanel" class="absolute top-14 md:top-4 right-2 md:right-4 left-2 md:left-auto md:w-80 bg-white rounded-xl shadow-2xl border border-amber-700/20 overflow-hidden z-20">
          <div class="bg-red-900 text-white p-4 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-base">{{ selectedMartyr?.name }}</h3>
              <p class="text-xs text-white/70 mt-0.5">{{ selectedMartyr?.tracks }}</p>
            </div>
            <button @click="showPanel = false" class="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer text-lg">✕</button>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex gap-3">
              <router-link :to="`/letter/${selectedMartyr?.id}`" class="flex-1 no-underline bg-amber-50 border border-amber-700/30 rounded-lg p-3 text-center hover:bg-amber-100 transition cursor-pointer">
                <div class="text-2xl mb-1">📜</div>
                <span class="text-sm font-medium text-amber-900">家书</span>
              </router-link>
              <router-link :to="`/photos/${selectedMartyr?.id}`" class="flex-1 no-underline bg-red-50 border border-red-700/30 rounded-lg p-3 text-center hover:bg-red-100 transition cursor-pointer">
                <div class="text-2xl mb-1">📷</div>
                <span class="text-sm font-medium text-red-900">照片</span>
              </router-link>
            </div>
            <p class="text-xs text-stone-600 leading-relaxed line-clamp-3">{{ selectedMartyr?.bio }}</p>
            <div v-if="selectedMartyr?.timeline">
              <h4 class="text-xs font-bold text-red-900 mb-2">生命轨迹</h4>
              <div class="space-y-1.5">
                <div v-for="(t, i) in selectedMartyr.timeline.slice(0, 3)" :key="i" class="flex items-center gap-2 text-xs">
                  <span class="text-red-900 font-bold w-14 flex-shrink-0">{{ t.year }}</span>
                  <span class="text-stone-600 truncate">{{ t.event }}</span>
                </div>
                <p v-if="selectedMartyr.timeline.length > 3" class="text-xs text-stone-400">... 查看家书页了解更多</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useMartyrStore } from '../../stores/martyr'

const martyrStore = useMartyrStore()
const mapLoading = ref(true)
const showPanel = ref(false)
const selectedId = ref(null)
const selectedMartyr = ref(null)
const sidebarOpen = ref(false)

let map = null
let AMapRef = null
let currentOverlays = [] // 当前选中英雄的高亮覆盖物
const showAllRoutes = ref(false)
let allRouteOverlays = []

onMounted(async () => {
  await martyrStore.fetchMartyrs()
  await nextTick()
  initMap()
})

async function initMap() {
  try {
    const AMapLoader = (await import('@amap/amap-jsapi-loader')).default
    AMapRef = await AMapLoader.load({
      key: '008190539a005fbc8b03e5ef0958f869',
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar']
    })

    map = new AMapRef.Map('map-container', {
      viewMode: '2D',
      zoom: 5,
      center: [104.07, 35.44],
      mapStyle: 'amap://styles/whitesmoke'
    })

    map.addControl(new AMapRef.Scale())
    map.addControl(new AMapRef.ToolBar({ position: 'RB' }))

    // 画所有标记点

    martyrStore.martyrs.forEach(martyr => {
      addMarker(martyr)
    })

    mapLoading.value = false
  } catch (e) {
    console.warn('地图加载失败:', e)
    mapLoading.value = false
  }
}

// 画足迹路线
function drawRoute(martyr, highlight = false) {
  const AMap = AMapRef
  const path = martyr.route.map(p => new AMap.LngLat(p[0], p[1]))
  const overlays = []

  // 描边底线（白色衬底）
  const borderLine = new AMap.Polyline({
    path,
    strokeColor: highlight ? '#b45309' : '#d6d3d1',
    strokeWeight: highlight ? 6 : 3,
    strokeOpacity: highlight ? 0.6 : 0.3,
    lineJoin: 'round',
    lineCap: 'round',
  })

  // 主线（虚线）
  const mainLine = new AMap.Polyline({
    path,
    strokeColor: highlight ? '#7f1d1d' : '#991b1b',
    strokeWeight: highlight ? 4 : 2,
    strokeOpacity: highlight ? 1 : 0.35,
    strokeStyle: 'dashed',
    strokeDasharray: [10, 5],
    lineJoin: 'round',
    lineCap: 'round',
  })

  map.add(borderLine)
  map.add(mainLine)
  overlays.push(borderLine, mainLine)

  if (highlight) {
    currentOverlays.push(borderLine, mainLine)

    // 路线节点标记
    martyr.route.forEach((p, i) => {
      const isFirst = i === 0
      const isLast = i === martyr.route.length - 1
      const label = martyr.routeLabels?.[i] || ''

      // 起始点/终止点：用自定义 HTML Marker 实现呼吸灯，跟随地图缩放
      if (isFirst || isLast) {
        const color = isFirst ? '#16a34a' : '#7f1d1d'
        const delay = isLast ? '0.5s' : '0s'
        const pulseMarker = new AMap.Marker({
          position: new AMap.LngLat(p[0], p[1]),
          content: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
            <span style="position:absolute;width:24px;height:24px;border-radius:50%;background:${color};opacity:0.25;animation:breatheExpand 2s ease-in-out ${delay} infinite;"></span>
            <span style="position:absolute;width:16px;height:16px;border-radius:50%;background:${color};opacity:0.45;animation:breatheExpand 2s ease-in-out calc(${delay} + 0.3s) infinite;"></span>
            <span style="position:relative;width:10px;height:10px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 6px ${color};"></span>
          </div>`,
          offset: new AMap.Pixel(-12, -12),
          zIndex: 150,
        })
        map.add(pulseMarker)
        currentOverlays.push(pulseMarker)
        overlays.push(pulseMarker)
      } else {
        // 中间节点：普通 CircleMarker
        const circleMarker = new AMap.CircleMarker({
          center: new AMap.LngLat(p[0], p[1]),
          radius: 5,
          fillColor: '#d97706',
          fillOpacity: 1,
          strokeColor: '#92400e',
          strokeWeight: 2,
          zIndex: 120,
        })
        map.add(circleMarker)
        currentOverlays.push(circleMarker)
        overlays.push(circleMarker)
      }

      // 地名标注
      if (label) {
        const text = new AMap.Text({
          text: label,
          position: new AMap.LngLat(p[0], p[1]),
          offset: new AMap.Pixel(0, -22),
          style: {
            'font-size': '11px',
            'color': '#7f1d1d',
            'background': 'rgba(255,255,255,0.9)',
            'border': '1px solid #b45309',
            'border-radius': '3px',
            'padding': '1px 6px',
            'font-weight': 'bold',
          }
        })
        map.add(text)
        currentOverlays.push(text)
        overlays.push(text)
      }
    })
  }
  return overlays
}

// 标记点（主位置）
function addMarker(martyr) {
  const AMap = AMapRef
  const marker = new AMap.Marker({
    position: [martyr.lng, martyr.lat],
    title: martyr.name,
    content: `<div style="background:#7f1d1d;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid #b45309;cursor:pointer;position:relative;">
      <span style="display:inline-block;width:6px;height:6px;background:#f59e0b;border-radius:50%;margin-right:4px;vertical-align:middle;"></span>${martyr.name}
    </div>`,
    offset: new AMap.Pixel(-40, -15),
  })

  marker.on('click', () => handleSelectMartyr(martyr))
  map.add(marker)
}

function toggleAllRoutes() {
  showAllRoutes.value = !showAllRoutes.value
  if (showAllRoutes.value) {
    martyrStore.martyrs.forEach(m => {
      if (m.route && m.route.length >= 2) {
        allRouteOverlays.push(...drawRoute(m, false))
      }
    })
  } else {
    allRouteOverlays.forEach(o => map.remove(o))
    allRouteOverlays = []
  }
}

function handleSelectMartyr(martyr) {
  // 清除上一个英雄的高亮覆盖物
  currentOverlays.forEach(o => map.remove(o))
  currentOverlays = []

  selectedId.value = martyr.id
  selectedMartyr.value = martyr
  martyrStore.setCurrentMartyr(martyr)
  showPanel.value = true

  // 手机端自动关闭侧边栏
  sidebarOpen.value = false

  // 画高亮路线
  if (martyr.route && martyr.route.length >= 2) {
    drawRoute(martyr, true)
  }

  // 平滑跳转
  if (map) {
    map.setZoomAndCenter(6, [martyr.lng, martyr.lat], true, 800)
  }
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateX(20px); }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>

<!-- 呼吸灯动画注入到全局，因为 scoped 样式无法作用于 AMap Marker 的 content HTML -->
<style>
@keyframes breatheExpand {
  0%   { transform: scale(1);   opacity: 0.5; }
  50%  { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(1);   opacity: 0.5; }
}
</style>
