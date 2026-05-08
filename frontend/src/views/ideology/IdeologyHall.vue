<template>
  <div class="max-w-5xl mx-auto px-4 py-8 pb-16">
    <div class="flex items-center justify-between gap-4 mb-6">
      <button
        type="button"
        @click="$router.back()"
        class="text-sm text-stone-500 hover:text-red-900 transition bg-transparent border-0 cursor-pointer"
      >
        ← 返回
      </button>
      <div class="text-center flex-1">
        <h1 class="text-2xl md:text-3xl font-bold text-red-900 mb-1">红色精神成长馆</h1>
        <p class="text-sm text-stone-500">思辨引领 · 解惑落地 · 积分成长</p>
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="store.curUser?.username"
          class="hidden sm:inline-flex text-xs bg-stone-50 text-stone-600 border border-stone-200 rounded-full px-3 py-1"
        >
          当前：{{ store.curUser.username }}
        </span>
        <span
          class="text-xs bg-amber-50 text-amber-800 border border-amber-100 rounded-full px-3 py-1"
        >
          积分：<strong>{{ store.myPoints }}</strong>
        </span>
      </div>
    </div>

    <div class="bg-white border border-amber-700/15 rounded-2xl shadow-sm overflow-hidden">
      <div class="flex flex-wrap gap-2 p-4 border-b border-stone-100">
        <button
          type="button"
          @click="tab = 'debate'"
          :class="tabBtn('debate', '思政辩论小广场')"
        >思政辩论小广场</button>
        <button
          type="button"
          @click="tab = 'points'"
          :class="tabBtn('points', '成长积分体系')"
        >成长积分体系</button>
        <button
          type="button"
          @click="tab = 'relief'"
          :class="tabBtn('relief', '红色精神解忧站')"
        >红色精神解忧站</button>
      </div>

      <div class="p-4 md:p-6">
        <DebateSquare v-if="tab === 'debate'" />
        <GrowthPoints v-if="tab === 'points'" />
        <ReliefStation v-if="tab === 'relief'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useIdeologyStore } from '../../stores/ideology'
import DebateSquare from './DebateSquare.vue'
import GrowthPoints from './GrowthPoints.vue'
import ReliefStation from './ReliefStation.vue'

const store = useIdeologyStore()
const tab = ref('debate')

function tabBtn(k, label) {
  return [
    'px-4 py-2.5 rounded-xl text-sm font-medium border transition cursor-pointer',
    tab.value === k ? 'bg-red-900 text-white border-red-900' : 'bg-white text-stone-600 border-stone-200 hover:border-red-900 hover:text-red-900'
  ].join(' ')
}
</script>

