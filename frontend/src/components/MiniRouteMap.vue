<template>
  <svg :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height" class="mini-route-map">
    <!-- 连线 -->
    <polyline
      :points="svgPoints"
      fill="none"
      stroke="#b45309"
      stroke-width="1.5"
      stroke-dasharray="4 3"
      stroke-linecap="round"
      opacity="0.6"
    />
    <!-- 途经点 -->
    <template v-for="(pt, i) in points" :key="i">
      <circle
        :cx="pt.x" :cy="pt.y"
        :r="i === 0 ? 4 : i === points.length - 1 ? 5 : 3"
        :fill="i === 0 ? '#16a34a' : i === points.length - 1 ? '#7f1d1d' : '#d97706'"
        :stroke="i === points.length - 1 ? '#7f1d1d' : 'none'"
        :stroke-width="i === points.length - 1 ? 2 : 0"
        :opacity="i === points.length - 1 ? 0.9 : 0.8"
      />
      <!-- 地名标注 -->
      <text
        v-if="labels[i]"
        :x="pt.x"
        :y="pt.y - 7"
        text-anchor="middle"
        fill="#78716c"
        font-size="8"
        font-family="'Microsoft YaHei', sans-serif"
      >{{ labels[i] }}</text>
    </template>
    <!-- 终点十字标记 -->
    <g v-if="points.length" :transform="`translate(${points[points.length-1].x},${points[points.length-1].y})`">
      <line x1="-3" y1="-3" x2="3" y2="3" stroke="#7f1d1d" stroke-width="1.5" opacity="0.5"/>
      <line x1="3" y1="-3" x2="-3" y2="3" stroke="#7f1d1d" stroke-width="1.5" opacity="0.5"/>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  route: { type: Array, default: () => [] },
  routeLabels: { type: Array, default: () => [] },
  width: { type: Number, default: 160 },
  height: { type: Number, default: 100 },
})

const padding = 18

const points = computed(() => {
  if (!props.route || props.route.length < 2) return []
  const lngs = props.route.map(p => p[0])
  const lats = props.route.map(p => p[1])
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const rangeLng = maxLng - minLng || 1
  const rangeLat = maxLat - minLat || 1
  const drawW = props.width - padding * 2
  const drawH = props.height - padding * 2

  return props.route.map(p => ({
    x: padding + ((p[0] - minLng) / rangeLng) * drawW,
    y: padding + (1 - (p[1] - minLat) / rangeLat) * drawH,
  }))
})

const labels = computed(() => props.routeLabels || [])

const svgPoints = computed(() =>
  points.value.map(p => `${p.x},${p.y}`).join(' ')
)
</script>
