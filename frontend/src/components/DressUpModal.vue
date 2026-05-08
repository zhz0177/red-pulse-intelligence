<template>
  <div class="fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
      <!-- 标题栏 -->
      <div class="bg-gradient-to-r from-red-900 to-red-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xl">✨</span>
          <h3 class="text-white text-lg font-bold">我的精灵 · 换装</h3>
        </div>
        <button @click="$emit('close')" class="text-white/70 hover:text-white text-xl bg-transparent border-0 cursor-pointer">&times;</button>
      </div>

      <!-- 预览区 -->
      <div class="bg-gradient-to-b from-stone-100 to-stone-50 py-6 flex justify-center flex-shrink-0">
        <div class="relative w-36 h-36">
          <img :src="mascotImg" class="w-full h-full object-contain drop-shadow-lg" draggable="false" />
          <div v-if="previewHead" class="absolute inset-0 pointer-events-none" :class="previewHead"></div>
          <div v-if="previewBody" class="absolute inset-0 pointer-events-none" :class="previewBody"></div>
          <div v-if="previewAccessory" class="absolute inset-0 pointer-events-none" :class="previewAccessory"></div>
        </div>
      </div>

      <!-- 分类标签 -->
      <div class="flex border-b border-stone-200 flex-shrink-0">
        <button
          v-for="tab in slotTabs"
          :key="tab.key"
          @click="activeSlot = tab.key"
          :class="['flex-1 py-2.5 text-sm font-medium transition border-b-2 bg-transparent cursor-pointer',
            activeSlot === tab.key ? 'text-red-900 border-red-900' : 'text-stone-500 border-transparent hover:text-stone-700']"
        >{{ tab.label }}</button>
      </div>

      <!-- 拥有的装扮列表 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="!filteredCostumes.length" class="text-center text-stone-400 py-6 text-sm">
          暂无{{ activeSlot === 'head' ? '头饰' : activeSlot === 'body' ? '服装' : '配饰' }}，去商城看看吧~
        </div>
        <div v-else class="grid grid-cols-3 gap-2">
          <button
            v-for="item in filteredCostumes"
            :key="item.item_id"
            @click="selectItem(item)"
            :class="['p-3 rounded-xl border-2 transition flex flex-col items-center gap-1 bg-transparent cursor-pointer',
              isSelected(item) ? 'border-red-900 bg-red-50' : 'border-stone-200 hover:border-red-300']"
          >
            <span class="text-2xl">{{ item.icon }}</span>
            <span class="text-xs text-stone-700 font-medium">{{ item.name }}</span>
            <span v-if="isSelected(item)" class="text-xs text-red-700">已装备</span>
          </button>
        </div>
      </div>

      <!-- 提示 -->
      <Transition name="fade">
        <div v-if="message" class="mx-4 mb-2 px-3 py-2 rounded-lg text-sm bg-green-50 text-green-700">{{ message }}</div>
      </Transition>

      <!-- 操作按钮 -->
      <div class="border-t border-stone-200 px-4 py-3 flex gap-2 flex-shrink-0">
        <button
          @click="handleReset"
          :disabled="saving"
          class="flex-1 text-sm py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 transition cursor-pointer bg-white disabled:opacity-50"
        >恢复默认</button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="flex-1 text-sm py-2.5 rounded-xl bg-red-900 text-white hover:bg-red-800 transition cursor-pointer border-0 disabled:opacity-50 font-medium"
        >保存装扮</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useShopStore } from '../stores/shop'
import mascotImg from '@/assets/mascot.png'

defineEmits(['close'])

const shopStore = useShopStore()
const activeSlot = ref('head')
const saving = ref(false)
const message = ref(null)
let msgTimer = null

// 当前选择（预览状态，未保存）
const selectedHead = ref(shopStore.costume.head_item_id || null)
const selectedBody = ref(shopStore.costume.body_item_id || null)
const selectedAccessory = ref(shopStore.costume.accessory_item_id || null)

const slotTabs = [
  { key: 'head', label: '头饰' },
  { key: 'body', label: '服装' },
  { key: 'accessory', label: '配饰' },
]

const ownedCostumes = computed(() => shopStore.inventory.filter(i => i.category === 'costume'))
const filteredCostumes = computed(() => ownedCostumes.value.filter(i => i.sub_category === activeSlot.value))

// 预览 CSS
const previewHead = computed(() => {
  const item = ownedCostumes.value.find(i => i.item_id === selectedHead.value)
  return item?.css_class || null
})
const previewBody = computed(() => {
  const item = ownedCostumes.value.find(i => i.item_id === selectedBody.value)
  return item?.css_class || null
})
const previewAccessory = computed(() => {
  const item = ownedCostumes.value.find(i => i.item_id === selectedAccessory.value)
  return item?.css_class || null
})

function isSelected(item) {
  if (item.sub_category === 'head') return selectedHead.value === item.item_id
  if (item.sub_category === 'body') return selectedBody.value === item.item_id
  return selectedAccessory.value === item.item_id
}

function selectItem(item) {
  // 再次点击取消选择
  if (item.sub_category === 'head') {
    selectedHead.value = selectedHead.value === item.item_id ? null : item.item_id
  } else if (item.sub_category === 'body') {
    selectedBody.value = selectedBody.value === item.item_id ? null : item.item_id
  } else {
    selectedAccessory.value = selectedAccessory.value === item.item_id ? null : item.item_id
  }
}

function showMsg(text) {
  clearTimeout(msgTimer)
  message.value = text
  msgTimer = setTimeout(() => { message.value = null }, 2000)
}

async function handleSave() {
  saving.value = true
  try {
    await shopStore.saveCostume({
      head_item_id: selectedHead.value,
      body_item_id: selectedBody.value,
      accessory_item_id: selectedAccessory.value,
    })
    showMsg('装扮已保存，小精灵已更新！')
  } catch (e) {
    showMsg(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleReset() {
  saving.value = true
  try {
    await shopStore.clearCostume()
    selectedHead.value = null
    selectedBody.value = null
    selectedAccessory.value = null
    showMsg('已恢复默认形象')
  } catch (e) {
    showMsg(e.message || '重置失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
