<template>
  <div class="relative pl-8">
    <!-- 时间线主轴 -->
    <div class="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-900 via-amber-700 to-red-900"></div>
    <!-- 节点 -->
    <div v-for="(item, index) in timeline" :key="index" class="relative mb-6 last:mb-0">
      <!-- 节点圆点 -->
      <div :class="[
        'absolute -left-5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs',
        item.type === 'birth' ? 'bg-green-100 border-green-600 text-green-600' :
        item.type === 'sacrifice' ? 'bg-red-100 border-red-900 text-red-900' :
        item.type === 'battle' ? 'bg-orange-100 border-orange-600 text-orange-600' :
        'bg-amber-100 border-amber-700 text-amber-700'
      ]">
        {{ item.type === 'birth' ? '★' : item.type === 'sacrifice' ? '✦' : item.type === 'battle' ? '⚔' : '●' }}
      </div>
      <!-- 内容卡片 -->
      <div class="bg-white rounded-lg p-3 shadow-sm border border-stone-200 hover:shadow-md transition ml-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold text-red-900 bg-red-50 px-2 py-0.5 rounded">{{ item.year }}</span>
          <span :class="[
            'text-xs px-1.5 py-0.5 rounded',
            item.type === 'birth' ? 'bg-green-50 text-green-700' :
            item.type === 'sacrifice' ? 'bg-red-50 text-red-700' :
            item.type === 'battle' ? 'bg-orange-50 text-orange-700' :
            'bg-amber-50 text-amber-700'
          ]">{{ typeLabel[item.type] }}</span>
        </div>
        <p class="text-sm text-stone-700">{{ item.event }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  timeline: { type: Array, default: () => [] }
})

const typeLabel = {
  birth: '诞生',
  milestone: '里程碑',
  battle: '战斗',
  sacrifice: '牺牲'
}
</script>
