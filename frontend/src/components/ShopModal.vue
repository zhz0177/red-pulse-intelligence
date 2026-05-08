<template>
  <div class="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4" @click.self="$emit('close')">
    <Transition name="modal">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
      <!-- 标题栏 -->
      <div class="bg-gradient-to-r from-red-900 to-red-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <span class="text-xl">🏪</span>
          <h3 class="text-white text-lg font-bold">传承商城</h3>
        </div>
        <div class="flex items-center gap-4">
          <span class="bg-amber-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
            🫘 {{ shopStore.beans }} 传承豆
          </span>
          <button @click="$emit('close')" class="text-white/70 hover:text-white text-xl bg-transparent border-0 cursor-pointer">&times;</button>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="flex border-b border-stone-200 flex-shrink-0">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['flex-1 py-3 text-sm font-medium transition border-b-2 bg-transparent cursor-pointer',
            activeTab === tab.key ? 'text-red-900 border-red-900' : 'text-stone-500 border-transparent hover:text-stone-700']"
        >{{ tab.label }}</button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- 提示信息 -->
        <Transition name="fade">
          <div v-if="message" :class="['mb-3 px-3 py-2 rounded-lg text-sm', message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700']">
            {{ message.text }}
          </div>
        </Transition>

        <!-- 精灵装扮 -->
        <div v-if="activeTab === 'costume'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            v-for="item in costumeItems"
            :key="item.id"
            class="bg-stone-50 rounded-xl p-3 border border-stone-200 hover:border-red-300 transition flex flex-col items-center gap-2"
          >
            <span class="text-3xl">{{ item.icon }}</span>
            <span class="text-sm font-medium text-stone-800">{{ item.name }}</span>
            <span class="text-xs text-stone-500">{{ item.description }}</span>
            <span class="text-xs text-stone-400">{{ item.sub_category === 'head' ? '头饰' : item.sub_category === 'body' ? '服装' : '配饰' }}</span>
            <div class="mt-auto w-full">
              <div v-if="isOwned(item.id)" class="text-center text-xs text-green-600 bg-green-50 rounded-lg py-1.5 font-medium">已拥有</div>
              <button
                v-else
                @click="handleBuy(item)"
                :disabled="buying"
                class="w-full text-xs bg-red-900 text-white rounded-lg py-1.5 hover:bg-red-800 disabled:opacity-50 transition cursor-pointer border-0 btn-stamp"
              >🫘 {{ item.price }} 豆购买</button>
            </div>
          </div>
        </div>

        <!-- 游戏道具 -->
        <div v-if="activeTab === 'game_item'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            v-for="item in gameItems"
            :key="item.id"
            class="bg-stone-50 rounded-xl p-3 border border-stone-200 hover:border-red-300 transition flex flex-col items-center gap-2"
          >
            <span class="text-3xl">{{ item.icon }}</span>
            <span class="text-sm font-medium text-stone-800">{{ item.name }}</span>
            <span class="text-xs text-stone-500">{{ item.description }}</span>
            <div class="mt-auto w-full flex flex-col gap-1">
              <div v-if="getOwnedQty(item.id) > 0" class="text-center text-xs text-stone-400">
                已有 {{ getOwnedQty(item.id) }} 个
              </div>
              <button
                @click="handleBuy(item)"
                :disabled="buying"
                class="w-full text-xs bg-red-900 text-white rounded-lg py-1.5 hover:bg-red-800 disabled:opacity-50 transition cursor-pointer border-0 btn-stamp"
              >🫘 {{ item.price }} 豆购买</button>
            </div>
          </div>
        </div>

        <!-- 我的背包 -->
        <div v-if="activeTab === 'bag'">
          <div v-if="!shopStore.inventory.length" class="text-center text-stone-400 py-10 text-sm">背包空空如也，快去选购吧~</div>
          <div v-else class="space-y-2">
            <div v-for="inv in shopStore.inventory" :key="inv.item_id" class="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3 border border-stone-200">
              <span class="text-2xl">{{ inv.icon }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-stone-800">{{ inv.name }}</div>
                <div class="text-xs text-stone-400">{{ inv.description }}</div>
              </div>
              <div class="text-xs text-stone-500">
                <span v-if="inv.category === 'game_item'">x{{ inv.quantity }}</span>
                <span v-else class="text-green-600">已拥有</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div v-if="activeTab === 'costume' || activeTab === 'bag'" class="border-t border-stone-200 px-4 py-3 flex-shrink-0">
        <button
          @click="goDressUp"
          class="w-full bg-gradient-to-r from-red-900 to-red-700 text-white text-sm py-2.5 rounded-xl hover:from-red-800 hover:to-red-600 transition cursor-pointer border-0 font-medium"
        >✨ 我的精灵 · 换装</button>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '../stores/shop'
import { getShopItems, buyItem } from '../api/shop'

const emit = defineEmits(['close'])

const shopStore = useShopStore()
const router = useRouter()
const activeTab = ref('costume')
const items = ref([])
const buying = ref(false)
const message = ref(null)
let msgTimer = null

const tabs = [
  { key: 'costume', label: '精灵装扮' },
  { key: 'game_item', label: '游戏道具' },
  { key: 'bag', label: '我的背包' },
]

const costumeItems = computed(() => items.value.filter(i => i.category === 'costume'))
const gameItems = computed(() => items.value.filter(i => i.category === 'game_item'))

function isOwned(itemId) {
  return shopStore.inventory.some(i => i.item_id === itemId && i.category === 'costume')
}
function getOwnedQty(itemId) {
  const found = shopStore.inventory.find(i => i.item_id === itemId)
  return found ? found.quantity : 0
}

function showMsg(text, type = 'success') {
  clearTimeout(msgTimer)
  message.value = { text, type }
  msgTimer = setTimeout(() => { message.value = null }, 3000)
}

async function handleBuy(item) {
  if (buying.value) return
  buying.value = true
  try {
    const res = await buyItem({ item_id: item.id })
    await Promise.all([shopStore.fetchBalance(), shopStore.fetchInventory()])
    showMsg(`成功购买「${item.name}」！`, 'success')
  } catch (e) {
    showMsg(e.message || '购买失败', 'error')
  } finally {
    buying.value = false
  }
}

function goDressUp() {
  // 入口位于商城内：跳转到独立页面
  // 同时关闭弹窗，避免叠层体验
  emit('close')
  router.push('/shop/dress-up')
}

// 加载商品列表
async function loadItems() {
  try {
    const res = await getShopItems()
    items.value = res.data
  } catch {}
}
loadItems()
</script>

<style scoped>
/* 弹窗弹出曲线 - 轻盈回弹 */
.modal-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.modal-enter-from {
  opacity: 0;
  transform: scale(0.88) translateY(24px);
}
.modal-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(12px);
}

/* 淡入提示信息 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 印章点击效果 */
.btn-stamp {
  position: relative;
  overflow: hidden;
  transform-origin: center;
  transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.12s ease;
}
.btn-stamp:active {
  transform: scale(0.93) rotate(-1deg);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
}
.btn-stamp::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  border-radius: inherit;
}
.btn-stamp:active::after {
  opacity: 1;
  transition: none;
}
</style>
