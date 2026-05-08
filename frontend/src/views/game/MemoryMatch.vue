<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <button @click="$router.back()" class="mb-4 text-sm text-stone-500 hover:text-red-900 transition bg-transparent border-0 cursor-pointer">
      ← 返回
    </button>

    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-red-900 mb-2">红色记忆翻翻看</h1>
      <p class="text-sm text-stone-500">翻牌配对英烈与事迹，用最少步数完成挑战</p>
    </div>

    <!-- 游戏状态 -->
    <div class="flex items-center justify-between mb-4 bg-white rounded-xl p-3 shadow-sm border border-amber-700/20">
      <div class="flex items-center gap-4 text-sm">
        <span class="text-stone-500">步数: <strong class="text-red-900">{{ moves }}</strong></span>
        <span class="text-stone-500">配对: <strong class="text-red-900">{{ matched }} / {{ pairs.length }}</strong></span>
        <span class="text-stone-500">用时: <strong class="text-red-900">{{ elapsed }}s</strong></span>
      </div>
      <div class="flex items-center gap-2">
        <button @click="initGame" class="px-3 py-1 text-sm bg-red-900 text-white rounded-lg border-0 cursor-pointer hover:bg-red-800 transition">
          重新开始
        </button>
        <button
          v-if="multiplierCard && !multiplierActive"
          type="button"
          @click="useMultiplierCard"
          class="px-3 py-1 text-sm bg-amber-600 text-white rounded-lg border-0 cursor-pointer hover:bg-amber-500 transition"
        >
          ✨ 使用翻倍卡
        </button>
        <span v-if="multiplierActive" class="text-xs bg-red-50 text-red-900 border border-red-200 px-2 py-1 rounded-full">
          翻倍已启用
        </span>
      </div>
    </div>

    <!-- 卡牌网格 -->
    <div class="grid grid-cols-4 gap-3">
      <div
        v-for="(card, idx) in cards"
        :key="idx"
        @click="flipCard(idx)"
        class="aspect-square cursor-pointer perspective"
      >
        <div
          class="relative w-full h-full transition-transform duration-500 transform-style-3d rounded-xl"
          :class="{ 'rotate-y-180': card.flipped || card.matched }"
        >
          <!-- 背面 -->
          <div class="absolute inset-0 backface-hidden rounded-xl border-2 border-amber-700/30 bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center shadow-md hover:shadow-lg transition">
            <span class="text-white text-3xl md:text-4xl">★</span>
          </div>
          <!-- 正面 -->
          <div
            class="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 flex items-center justify-center p-2 shadow-md text-center"
            :class="card.matched ? 'bg-green-50 border-green-400' : card.type === 'name' ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'"
          >
            <span class="text-xs md:text-sm font-medium leading-tight" :class="card.type === 'name' ? 'text-red-900' : 'text-amber-800'">
              {{ card.text }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏完成 -->
    <div v-if="gameOver" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="gameOver = false">
      <div class="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm">
        <div class="text-5xl mb-3">🎉</div>
        <h2 class="text-xl font-bold text-red-900 mb-2">恭喜通关！</h2>
        <p class="text-stone-500 mb-4">用了 <strong class="text-red-900">{{ moves }}</strong> 步，耗时 <strong class="text-red-900">{{ elapsed }}s</strong></p>
        <button @click="initGame(); gameOver = false" class="px-6 py-3 bg-red-900 text-white rounded-xl font-bold hover:bg-red-800 transition border-0 cursor-pointer">
          再来一局
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useShopStore } from '../../stores/shop'
import { useGameItem } from '../../api/shop'

const PAIRS_DATA = [
  { name: '赵一曼', deed: '东北抗联女英雄' },
  { name: '杨靖宇', deed: '胃中仅有草根棉絮' },
  { name: '刘胡兰', deed: '生的伟大死的光荣' },
  { name: '黄继光', deed: '胸膛堵住敌人枪眼' },
  { name: '董存瑞', deed: '手举炸药包炸碉堡' },
  { name: '左权', deed: '八路军最高牺牲将领' },
  { name: '江竹筠', deed: '渣滓洞坚贞不屈' },
  { name: '方志敏', deed: '《可爱的中国》作者' },
  { name: '李大钊', deed: '中共主要创始人之一' },
  { name: '夏明翰', deed: '砍头不要紧只要主义真' },
  { name: '瞿秋白', deed: '主持八七会议' },
  { name: '张思德', deed: '为人民服务的典范' },
]

const pairs = ref([])
const cards = ref([])
const moves = ref(0)
const matched = ref(0)
const flippedIndices = ref([])
const locked = ref(false)
const gameOver = ref(false)
const elapsed = ref(0)
let timer = null
const shopStore = useShopStore()
const rewarded = ref(false)
const multiplierActive = ref(false)

const multiplierCard = computed(() => (
  shopStore.inventory.find(i => i.category === 'game_item' && i.sub_category === 'multiplier' && i.quantity > 0) || null
))

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function initGame() {
  gameOver.value = false
  rewarded.value = false
  multiplierActive.value = false
  moves.value = 0
  matched.value = 0
  flippedIndices.value = []
  locked.value = false
  elapsed.value = 0
  if (timer) clearInterval(timer)

  // 随机选8对
  const selected = shuffle(PAIRS_DATA).slice(0, 8)
  pairs.value = selected

  const deck = []
  selected.forEach((p, i) => {
    deck.push({ pairId: i, type: 'name', text: p.name, flipped: false, matched: false })
    deck.push({ pairId: i, type: 'deed', text: p.deed, flipped: false, matched: false })
  })
  cards.value = shuffle(deck)

  timer = setInterval(() => { elapsed.value++ }, 1000)
}

function flipCard(idx) {
  if (locked.value) return
  const card = cards.value[idx]
  if (card.flipped || card.matched) return

  card.flipped = true
  flippedIndices.value.push(idx)

  if (flippedIndices.value.length === 2) {
    moves.value++
    locked.value = true
    const [i, j] = flippedIndices.value
    const a = cards.value[i]
    const b = cards.value[j]

    if (a.pairId === b.pairId && a.type !== b.type) {
      // 配对成功
      setTimeout(() => {
        a.matched = true
        b.matched = true
        matched.value++
        flippedIndices.value = []
        locked.value = false
        if (matched.value === pairs.value.length) {
          clearInterval(timer)
          gameOver.value = true
        }
      }, 500)
    } else {
      // 配对失败
      setTimeout(() => {
        a.flipped = false
        b.flipped = false
        flippedIndices.value = []
        locked.value = false
      }, 800)
    }
  }
}

onMounted(() => { initGame() })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

watch(gameOver, async (v) => {
  if (v && !rewarded.value) {
    rewarded.value = true
    const reason = multiplierActive.value ? 'memory_game_double' : 'memory_game'
    try { await shopStore.earn(reason) } catch {}
  }
})

async function useMultiplierCard() {
  if (!multiplierCard.value || multiplierActive.value) return
  try {
    await useGameItem({ item_id: multiplierCard.value.item_id })
    await shopStore.fetchInventory()
    multiplierActive.value = true
  } catch (e) {
    alert(e.message || '使用翻倍卡失败')
  }
}
</script>

<style scoped>
.perspective { perspective: 600px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }
</style>
