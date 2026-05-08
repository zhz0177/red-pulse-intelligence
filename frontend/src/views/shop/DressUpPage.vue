<template>
  <div class="max-w-4xl mx-auto px-4 py-8 pb-16">
    <button
      type="button"
      @click="$router.back()"
      class="mb-4 text-sm text-stone-500 hover:text-red-900 transition bg-transparent border-0 cursor-pointer"
    >
      ← 返回
    </button>

    <div class="text-center mb-8">
      <h1 class="text-2xl md:text-3xl font-bold text-red-900 mb-2">我的精灵・换装</h1>
      <p class="text-sm text-stone-500">
        选择头部 / 服装 / 配饰，保存后右下角小精灵将同步生效
      </p>
    </div>

    <div class="rounded-2xl shadow-xl border-2 border-amber-700/20 overflow-hidden bg-white">
      <!-- 标题栏 -->
      <div class="bg-gradient-to-r from-red-900 to-red-800 text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">✨</span>
          <div>
            <div class="text-sm text-amber-200/90 uppercase tracking-widest">传承豆体系</div>
            <div class="text-lg font-bold">当前装扮预览</div>
          </div>
        </div>
      </div>

      <!-- 预览区 + 列表区 -->
      <div class="p-6 md:p-8">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- 预览图 -->
          <div class="lg:w-44 w-full flex justify-center lg:justify-start">
            <div class="relative w-36 h-36">
              <img :src="mascotImg" class="w-full h-full object-contain drop-shadow-lg" draggable="false" />
              <div v-if="previewHead" class="absolute inset-0 pointer-events-none" :class="previewHead"></div>
              <div v-if="previewBody" class="absolute inset-0 pointer-events-none" :class="previewBody"></div>
              <div v-if="previewAccessory" class="absolute inset-0 pointer-events-none" :class="previewAccessory"></div>
            </div>
          </div>

          <!-- 列表与操作 -->
          <div class="flex-1 min-w-0">
            <div class="flex border-b border-stone-200 mb-4">
              <button
                v-for="tab in slotTabs"
                :key="tab.key"
                type="button"
                @click="activeSlot = tab.key"
                :class="[
                  'flex-1 py-2.5 text-sm font-medium transition border-b-2 bg-transparent cursor-pointer',
                  activeSlot === tab.key ? 'text-red-900 border-red-900' : 'text-stone-500 border-transparent hover:text-stone-700',
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <div v-if="!filteredCostumes.length" class="text-center text-stone-400 py-10 text-sm">
              暂无{{ activeSlot === 'head' ? '头饰' : activeSlot === 'body' ? '服装' : '配饰' }}，去商城看看吧~
            </div>

            <div v-else class="grid grid-cols-3 gap-2 mb-6">
              <button
                v-for="item in filteredCostumes"
                :key="item.item_id"
                type="button"
                @click="selectItem(item)"
                :class="[
                  'p-3 rounded-xl border-2 transition flex flex-col items-center gap-1 bg-transparent cursor-pointer',
                  isSelected(item) ? 'border-red-900 bg-red-50' : 'border-stone-200 hover:border-red-300'
                ]"
              >
                <span class="text-2xl">{{ item.icon }}</span>
                <span class="text-xs text-stone-700 font-medium">{{ item.name }}</span>
                <span v-if="isSelected(item)" class="text-xs text-red-700">已装备</span>
              </button>
            </div>

            <div class="flex gap-2 flex-col sm:flex-row">
              <button
                type="button"
                @click="handleReset"
                :disabled="saving"
                class="flex-1 text-sm py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 transition cursor-pointer bg-white disabled:opacity-50"
              >
                恢复默认形象
              </button>
              <button
                type="button"
                @click="handleSave"
                :disabled="saving"
                class="flex-1 text-sm py-2.5 rounded-xl bg-red-900 text-white hover:bg-red-800 transition cursor-pointer border-0 disabled:opacity-50 font-medium"
              >
                保存装扮
              </button>
            </div>
            <div v-if="message" class="mt-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-2">
              {{ message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import mascotImg from '@/assets/mascot.png'
import { useShopStore } from '@/stores/shop'

const shopStore = useShopStore()

const activeSlot = ref('head')
const saving = ref(false)
const message = ref('')

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
  if (item.sub_category === 'head') {
    selectedHead.value = selectedHead.value === item.item_id ? null : item.item_id
  } else if (item.sub_category === 'body') {
    selectedBody.value = selectedBody.value === item.item_id ? null : item.item_id
  } else {
    selectedAccessory.value = selectedAccessory.value === item.item_id ? null : item.item_id
  }
}

function showMsg(text) {
  message.value = text
  setTimeout(() => { message.value = '' }, 2000)
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

onMounted(async () => {
  await shopStore.refreshAll()
  selectedHead.value = shopStore.costume.head_item_id || null
  selectedBody.value = shopStore.costume.body_item_id || null
  selectedAccessory.value = shopStore.costume.accessory_item_id || null
})
</script>

