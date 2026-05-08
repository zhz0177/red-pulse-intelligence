<template>
  <div>
    <!-- 勋章卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      <div v-for="card in statCards" :key="card.label" class="medal-card p-6 cursor-default">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-xs tracking-widest mb-2" style="color: #8A8078;">{{ card.label }}</p>
            <p class="text-4xl font-bold medal-value" style="color: #6B1111; font-variant-numeric: tabular-nums;">{{ card.value }}</p>
          </div>
          <div class="medal-icon-wrap ml-4" v-html="card.svgIcon"></div>
        </div>
        <div class="mt-4 flex items-center gap-2">
          <div class="flex-1 h-1 rounded-full overflow-hidden" style="background: #F2EAD8;">
            <div class="h-full rounded-full transition-all duration-1000" :style="{ width: Math.min(card.growth * 4, 100) + '%', background: 'linear-gradient(90deg, #C0392B, #C8A84B)' }"></div>
          </div>
          <span class="text-xs font-medium" style="color: #C0392B;">↑ {{ card.growth }}%</span>
        </div>
        <p class="text-xs mt-1" style="color: #8A8078;">较上月增长</p>
      </div>
    </div>

    <!-- Echarts 大屏 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <!-- 志愿者参与趋势 -->
      <div class="medal-card p-4 md:p-6">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-4 rounded-full" style="background: linear-gradient(180deg, #C0392B, #C8A84B);"></div>
          <h3 class="text-sm font-bold tracking-wide" style="color: #4A3728;">志愿者参与趋势</h3>
        </div>
        <div ref="lineChartRef" class="h-48 md:h-64"></div>
      </div>

      <!-- 项目类型分布 -->
      <div class="medal-card p-4 md:p-6">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-1 h-4 rounded-full" style="background: linear-gradient(180deg, #C0392B, #C8A84B);"></div>
          <h3 class="text-sm font-bold tracking-wide" style="color: #4A3728;">项目类型分布</h3>
        </div>
        <!-- 分类图例+图标 -->
        <div class="flex flex-wrap gap-2 mb-3">
          <div v-for="cat in pieCategories" :key="cat.name" class="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs" :style="{ background: cat.color + '18', border: '1px solid ' + cat.color + '44', color: cat.color }">
            <span v-html="cat.svgIcon" class="flex-shrink-0"></span>
            <span>{{ cat.name }}</span>
          </div>
        </div>
        <div ref="pieChartRef" class="h-40 md:h-52"></div>
      </div>

      <!-- 各坐标点访问量 -->
      <div class="medal-card p-4 md:p-6 md:col-span-2">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-4 rounded-full" style="background: linear-gradient(180deg, #C0392B, #C8A84B);"></div>
          <h3 class="text-sm font-bold tracking-wide" style="color: #4A3728;">红色坐标点访问量</h3>
        </div>
        <div ref="barChartRef" class="h-64 md:h-[500px]"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { getStats } from '../../api/project'

const lineChartRef = ref(null)
const pieChartRef = ref(null)
const barChartRef = ref(null)

const statCards = reactive([
  {
    label: '已修复照片数量', value: 0, growth: 15,
    svgIcon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="22" height="18" rx="3" stroke="#C0392B" stroke-width="1.5"/>
      <circle cx="10" cy="12" r="2.5" stroke="#C0392B" stroke-width="1.3"/>
      <path d="M3,20 L9,14 L14,19 L18,15 L25,22" stroke="#C8A84B" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`
  },
  {
    label: '参与志愿者人数', value: 0, growth: 23,
    svgIcon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="9" r="3.5" stroke="#C0392B" stroke-width="1.5"/>
      <path d="M2,24 C2,18 6,15 10,15 C14,15 18,18 18,24" stroke="#C0392B" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="20" cy="9" r="2.5" stroke="#C8A84B" stroke-width="1.3"/>
      <path d="M18,17 C20,16.5 26,18 26,24" stroke="#C8A84B" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`
  },
  {
    label: '覆盖红色坐标点', value: 0, growth: 8,
    svgIcon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14,3 C9.6,3 6,6.6 6,11 C6,17 14,25 14,25 C14,25 22,17 22,11 C22,6.6 18.4,3 14,3 Z" stroke="#C0392B" stroke-width="1.5"/>
      <circle cx="14" cy="11" r="3" fill="#C8A84B" opacity="0.8"/>
    </svg>`
  },
])

const pieCategories = [
  {
    name: '照片修复', color: '#8B1A1A',
    svgIcon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="4" cy="5.5" r="1.2" stroke="currentColor" stroke-width="1"/><path d="M1,9 L4,6.5 L6.5,8.5 L8,7 L11,9.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>`
  },
  {
    name: '老兵采访', color: '#C0392B',
    svgIcon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2" stroke="currentColor" stroke-width="1.2"/><path d="M2,11 C2,8.2 3.8,7 6,7 C8.2,7 10,8.2 10,11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M8,1.5 L9.5,3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>`
  },
  {
    name: '文物保护', color: '#7B5A2A',
    svgIcon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2,10 L2,5 L6,2 L10,5 L10,10 Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><rect x="4.5" y="7" width="3" height="3" stroke="currentColor" stroke-width="1"/></svg>`
  },
  {
    name: '资料整理', color: '#4A6741',
    svgIcon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="1" width="8" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M4,4 L8,4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M4,6.5 L8,6.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M4,9 L6,9" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>`
  },
]

onMounted(async () => {
  try {
    const res = await getStats()
    statCards[0].value = res.data.photos || 0
    statCards[1].value = res.data.volunteers || 0
    statCards[2].value = res.data.spots || 0
  } catch (e) {
    statCards[0].value = 128
    statCards[1].value = 356
    statCards[2].value = 35
  }
  initLineChart()
  initPieChart()
  initBarChart()
})

function initLineChart() {
  const chart = echarts.init(lineChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: '#fff9f0', borderColor: '#C0392B22', textStyle: { color: '#4A3728' } },
    grid: { top: 10, right: 20, bottom: 30, left: 40 },
    xAxis: {
      type: 'category',
      data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
      axisLine: { lineStyle: { color: '#E8DDD0' } },
      axisLabel: { color: '#8A8078', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F2EAD8', type: 'dashed' } },
      axisLabel: { color: '#8A8078', fontSize: 11 }
    },
    series: [{
      type: 'line',
      smooth: true,
      data: [12, 19, 15, 28, 35, 42, 38, 55, 63, 70, 68, 82],
      lineStyle: { color: '#C0392B', width: 2.5 },
      itemStyle: { color: '#C0392B', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(192,57,43,0.25)' },
          { offset: 1, color: 'rgba(192,57,43,0.02)' }
        ])
      },
      symbol: 'circle', symbolSize: 6
    }]
  })
  window.addEventListener('resize', () => chart.resize())
}

function initPieChart() {
  const chart = echarts.init(pieChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item', backgroundColor: '#fff9f0', borderColor: '#C0392B22', textStyle: { color: '#4A3728' }, formatter: '{b}: {c}项 ({d}%)' },
    color: ['#8B1A1A', '#C0392B', '#7B5A2A', '#4A6741'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '55%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff9f0', borderWidth: 3 },
      label: { show: true, formatter: '{d}%', fontSize: 11, color: '#4A3728' },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(139,26,26,0.3)' } },
      data: [
        { value: 22, name: '照片修复' },
        { value: 18, name: '老兵采访' },
        { value: 12, name: '文物保护' },
        { value: 10, name: '资料整理' }
      ]
    }]
  })
  window.addEventListener('resize', () => chart.resize())
}

function initBarChart() {
  const chart = echarts.init(barChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: '#fff9f0', borderColor: '#C0392B22', textStyle: { color: '#4A3728' } },
    grid: { top: 10, right: 30, bottom: 40, left: 120 },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F2EAD8', type: 'dashed' } },
      axisLabel: { color: '#8A8078', fontSize: 11 }
    },
    yAxis: {
      type: 'category',
      data: ['黄公略纪念地','张太雷纪念馆','罗炳辉纪念馆','吴焕先纪念地','陈康容纪念馆','韦拔群纪念馆','彭湃故居','恽代英纪念馆','刘志丹纪念馆','赵尚志纪念馆','戴安兰纪念馆','赵世炎故居','瞿秋白纪念馆','陈乔年纪念碑','陈延年纪念碑','寻淮洲纪念馆','关向应纪念馆','夏明翰纪念馆','谢晋元纪念馆','向警予纪念馆','张自忠纪念馆','叶挺纪念馆','蔡和森故居','李大钊纪念馆','方志敏纪念馆','狼牙山五壮士','张思德纪念地','江竹筠纪念馆','左权纪念馆','董存瑞纪念馆','邱少云纪念馆','黄继光纪念馆','刘胡兰纪念馆','杨靖宇纪念馆','赵一曼纪念馆'],
      axisLine: { lineStyle: { color: '#E8DDD0' } },
      axisLabel: { color: '#6B5A4A', fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: [15,18,20,22,24,26,28,30,32,35,36,38,40,42,44,46,48,51,53,55,58,61,65,68,72,76,80,85,90,96,102,108,115,125,138],
      barWidth: 14,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#8B1A1A' },
          { offset: 0.6, color: '#C0392B' },
          { offset: 1, color: '#C8A84B' }
        ])
      },
      emphasis: { itemStyle: { opacity: 0.85 } }
    }]
  })
  window.addEventListener('resize', () => chart.resize())
}
</script>
