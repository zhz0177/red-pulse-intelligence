<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- 页头 -->
    <div class="bg-red-900 text-white rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-bold tracking-wider">珍贵影像</h1>
      <p class="text-white/70 text-sm mt-2">35位革命先烈的历史照片存档，按英雄分类展示</p>
    </div>

    <!-- 英雄筛选标签 -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button
        @click="selectedHero = null"
        :class="['px-3 py-1.5 rounded-full text-sm border transition cursor-pointer',
          !selectedHero ? 'bg-red-900 text-white border-red-900' : 'bg-white text-stone-600 border-stone-300 hover:border-red-900 hover:text-red-900']"
      >全部</button>
      <button
        v-for="hero in allPhotos"
        :key="hero.id"
        @click="selectedHero = hero.id"
        :class="['px-3 py-1.5 rounded-full text-sm border transition cursor-pointer',
          selectedHero === hero.id ? 'bg-red-900 text-white border-red-900' : 'bg-white text-stone-600 border-stone-300 hover:border-red-900 hover:text-red-900']"
      >{{ hero.name }} ({{ hero.photos.length }})</button>
    </div>

    <!-- 按英雄分组显示 -->
    <div v-for="hero in displayedHeroes" :key="hero.id" class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {{ hero.name.charAt(0) }}
        </div>
        <div>
          <h2 class="text-lg font-bold text-stone-800">{{ hero.name }}</h2>
          <p class="text-xs text-stone-400">{{ hero.photos.length }} 张历史照片</p>
        </div>
        <router-link :to="`/photos/${hero.id}`" class="ml-auto text-xs text-red-900 hover:underline no-underline">
          查看详情 &rarr;
        </router-link>
      </div>

      <!-- 照片网格 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div
          v-for="(photo, index) in hero.photos"
          :key="index"
          class="group cursor-pointer"
          @click="openLightbox(hero, index)"
        >
          <div class="relative overflow-hidden rounded-lg border border-stone-200 shadow-sm hover:shadow-md transition aspect-[4/3]">
            <img :src="photo.url" :alt="photo.desc" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition">
              <p class="absolute bottom-1.5 left-2 right-2 text-white text-xs truncate">{{ photo.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!displayedHeroes.length" class="text-center py-16">
      <div class="text-4xl mb-3">📷</div>
      <p class="text-stone-400">暂无照片</p>
    </div>

    <!-- 灯箱 -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="lightbox" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" @click.self="lightbox = null">
          <button @click="lightbox = null" class="absolute top-4 right-4 text-white/80 hover:text-white text-2xl bg-transparent border-0 cursor-pointer z-10">✕</button>
          <button v-if="lightbox.index > 0" @click="lightbox.index--" class="absolute left-4 text-white/80 hover:text-white text-3xl bg-transparent border-0 cursor-pointer">&lsaquo;</button>
          <button v-if="lightbox.index < lightbox.photos.length - 1" @click="lightbox.index++" class="absolute right-4 text-white/80 hover:text-white text-3xl bg-transparent border-0 cursor-pointer">&rsaquo;</button>
          <div class="max-w-4xl max-h-[85vh] px-12">
            <img :src="lightbox.photos[lightbox.index].url" :alt="lightbox.photos[lightbox.index].desc" class="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div class="text-center mt-3">
              <p class="text-white text-sm">{{ lightbox.heroName }} - {{ lightbox.photos[lightbox.index].desc }}</p>
              <p class="text-white/50 text-xs mt-1">{{ lightbox.index + 1 }} / {{ lightbox.photos.length }}</p>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAllHeroPhotos } from '../../config/heroPhotos'

const allPhotos = getAllHeroPhotos()
const selectedHero = ref(null)
const lightbox = ref(null)

const displayedHeroes = computed(() => {
  if (selectedHero.value) {
    return allPhotos.filter(h => h.id === selectedHero.value)
  }
  return allPhotos
})

function openLightbox(hero, index) {
  lightbox.value = { heroName: hero.name, photos: hero.photos, index }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
