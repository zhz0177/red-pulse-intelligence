<template>
  <div class="relief-station space-y-8">
    <!-- 页头 -->
    <header class="space-y-2">
      <h2 class="text-xl font-bold text-red-900">红色精神解忧站</h2>
      <p class="text-sm text-stone-500 max-w-2xl leading-relaxed">
        提交困惑 → 匹配红色精神 → 专业思政解读与落地建议 → 公开共鸣与成长誓言（积分联动）。
      </p>
    </header>

    <!-- 三大区域：页面级分区标签（仅排版，不改变功能） -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5">
      <!-- 区域一：困惑提交 -->
      <div class="lg:col-span-1 space-y-2">
        <div class="flex items-center gap-2 px-1">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-red-900 text-white text-xs font-black shrink-0">1</span>
          <div>
            <div class="text-sm font-bold text-stone-900">困惑提交</div>
            <div class="text-[11px] text-stone-500">匿名/实名 · 专家解读后公开</div>
          </div>
        </div>
        <div class="ideology-card rounded-2xl border border-amber-700/15 bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <button
            type="button"
            @click="submitOpen = !submitOpen"
            class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-gradient-to-r from-red-900/6 to-transparent hover:from-red-900/10 transition-colors"
          >
            <h3 class="font-bold text-stone-900">填写并提交</h3>
            <span class="text-stone-400 text-sm transition-transform duration-300 shrink-0" :class="submitOpen ? 'rotate-180' : ''">▼</span>
          </button>
          <div v-show="submitOpen" class="px-4 pb-5 pt-0 border-t border-stone-100 animate-fade">
            <p class="text-sm text-stone-500 mt-4 mb-4 leading-relaxed">
              支持匿名/实名提交。系统匹配对应红色精神与先辈事迹，专家解读后公开展示。
            </p>
            <div class="space-y-4">
              <div>
                <label class="block text-xs text-stone-600 mb-1.5">困惑分类</label>
                <select
                  v-model="form.type"
                  class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900"
                >
                  <option>学业</option>
                  <option>就业</option>
                  <option>人际</option>
                  <option>奋斗倦怠</option>
                  <option>理想</option>
                  <option>社会认知偏差</option>
                </select>
              </div>
              <div class="flex items-center gap-3 flex-wrap">
                <label class="text-xs text-stone-600">匿名提交</label>
                <input type="checkbox" v-model="form.anonymousMode" class="h-4 w-4 accent-red-900" />
                <div class="text-xs text-stone-500">
                  {{ form.anonymousMode ? '公开时隐去姓名' : '将显示你的用户名（可在成长档案中体现）' }}
                </div>
              </div>
              <div>
                <label class="block text-xs text-stone-600 mb-1.5">困惑内容</label>
                <textarea
                  v-model="form.content"
                  rows="6"
                  class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-red-900"
                  placeholder="例如：我在学习/工作中遇到挫折…我担心的是什么…我真正想要的是…"
                />
                <div class="text-xs text-stone-500 mt-1.5">
                  字数：<strong class="text-stone-800">{{ lenCN(form.content) }}</strong> / 80-800
                </div>
              </div>

              <button
                type="button"
                @click="submitRelief"
                :disabled="submitting"
                class="w-full px-4 py-2.5 rounded-xl bg-red-900 text-white text-sm font-bold border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 relief-btn hover:-translate-y-0.5 hover:shadow-lg shadow-md transition-all duration-300"
              >
                <span
                  v-if="submitting"
                  class="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
                {{ submitting ? '提交中…' : '提交困惑并等待解读' }}
              </button>

              <div v-if="submitErr" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {{ submitErr }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 区域二 + 三：公开共鸣（内含每条目的「成长誓言」子区） -->
      <div class="lg:col-span-2 space-y-2 min-w-0">
        <div class="flex flex-wrap items-start justify-between gap-3 px-1">
          <div class="flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-red-900 text-white text-xs font-black shrink-0">2</span>
            <div>
              <div class="text-sm font-bold text-stone-900">公开共鸣</div>
              <div class="text-[11px] text-stone-500">解读展示 · 评论互助 · 感悟 · 下滑加载更多</div>
            </div>
          </div>
          <div class="flex items-center gap-2 pl-9 lg:pl-0">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white text-xs font-black shrink-0">3</span>
            <div>
              <div class="text-sm font-bold text-stone-900">成长誓言</div>
              <div class="text-[11px] text-stone-500">每条公开解忧卡片内独立立誓</div>
            </div>
          </div>
        </div>

        <div class="ideology-card rounded-2xl border border-stone-200 bg-white shadow-lg overflow-hidden flex flex-col min-h-[200px] hover:shadow-xl transition-shadow duration-300">
          <button
            type="button"
            @click="resonanceOpen = !resonanceOpen"
            class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-gradient-to-r from-red-900/6 to-transparent hover:from-red-900/10 transition-colors shrink-0"
          >
            <div>
              <h3 class="font-bold text-stone-900">已通过解读的公开列表</h3>
              <div class="text-xs text-stone-500 font-normal mt-0.5">浏览专家解读、参与互动与立誓</div>
            </div>
            <span class="text-stone-400 text-sm transition-transform duration-300 shrink-0" :class="resonanceOpen ? 'rotate-180' : ''">▼</span>
          </button>

          <div v-show="resonanceOpen" class="flex flex-col flex-1 min-h-0 border-t border-stone-100 animate-fade">
            <div class="flex items-center justify-between gap-3 flex-wrap px-4 py-3.5 border-b border-stone-200 bg-stone-50/60">
              <div class="text-xs text-stone-600">共 <strong class="text-red-900">{{ publishedReliefsFull.length }}</strong> 条</div>
              <div class="flex items-center gap-2">
                <label class="text-xs text-stone-600">筛选</label>
                <select
                  v-model="filterType"
                  class="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-900 bg-white"
                >
                  <option value="">全部</option>
                  <option>学业</option>
                  <option>就业</option>
                  <option>人际</option>
                  <option>奋斗倦怠</option>
                  <option>理想</option>
                  <option>社会认知偏差</option>
                </select>
              </div>
            </div>

            <div
              ref="resonanceScrollRef"
              class="flex-1 overflow-y-auto overscroll-contain px-4 py-5 max-h-[min(75vh,820px)] scroll-smooth"
              @scroll.passive="onResonanceScroll"
            >
              <div v-if="publishedReliefsFull.length === 0" class="text-sm text-stone-500 py-14 text-center leading-relaxed px-4">
                暂无公开解忧条目：请提交困惑并等待专家发布。
              </div>
              <div v-else class="space-y-8">
                <article
                  v-for="r in publishedReliefsVisible"
                  :key="r.id"
                  class="ideology-card rounded-2xl border border-stone-200 bg-stone-50/90 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <!-- 卡片头 -->
                  <div class="p-4 pb-3 border-b border-stone-200/80 bg-white/60">
                    <div class="flex items-start justify-between gap-3 flex-wrap">
                      <div class="min-w-0">
                        <div class="text-xs text-stone-500">分类：{{ r.type }} · {{ timeAgo(r.createdAt) }}</div>
                        <div class="text-sm font-bold text-red-900 mt-1">
                          {{ r.authorMode === 'anonymous' ? '匿名用户' : (r.authorName || '用户') }}
                        </div>
                      </div>
                      <button
                        type="button"
                        @click="likeRelief(r.id)"
                        class="text-xs px-3 py-1.5 rounded-xl border border-stone-200 hover:border-red-900/60 hover:text-red-900 transition-all cursor-pointer bg-white relief-btn hover:-translate-y-0.5"
                      >
                        👍 赞 {{ r.likes }}
                      </button>
                    </div>
                  </div>

                  <div class="p-4 space-y-0 divide-y divide-stone-200/90">
                    <!-- 子区块 A：困惑与解读 -->
                    <section class="pt-1 pb-6 first:pt-0">
                      <h4 class="text-xs font-bold text-red-900/90 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span class="h-px w-8 shrink-0 bg-red-200 rounded" />
                        困惑与专家解读
                        <span class="h-px flex-1 bg-red-200 rounded" />
                      </h4>
                      <div class="rounded-2xl border border-stone-200 bg-white p-4 mb-4 shadow-sm">
                        <div class="text-xs text-stone-500 mb-1.5">用户困惑（已隐私处理）</div>
                        <div class="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{{ r.content }}</div>
                      </div>
                      <div class="spirit-swiper-wrap">
                        <Swiper
                          :modules="spiritSwiperModules"
                          :slides-per-view="1"
                          :space-between="12"
                          :pagination="{ clickable: true, dynamicBullets: true }"
                          :breakpoints="{ 768: { slidesPerView: 2, spaceBetween: 14 } }"
                          class="spirit-swiper pb-7 rounded-xl"
                        >
                          <SwiperSlide>
                            <div class="h-full rounded-2xl border border-stone-200 bg-white p-3 shadow-sm min-h-[140px]">
                              <div class="text-xs text-amber-800 font-bold mb-2">匹配红色精神</div>
                              <div class="text-sm font-bold text-stone-900">{{ r.decode?.redSpirit || '' }}</div>
                              <div class="text-xs text-stone-600 mt-2" v-if="r.decode?.martyr">先辈事迹参考：{{ r.decode.martyr }}</div>
                              <ul v-if="r.decode?.qualities?.length" class="mt-2 space-y-1">
                                <li
                                  v-for="q in r.decode.qualities"
                                  :key="q"
                                  class="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2 py-1 text-stone-700"
                                >
                                  {{ q }}
                                </li>
                              </ul>
                            </div>
                          </SwiperSlide>
                          <SwiperSlide>
                            <div class="h-full rounded-2xl border border-stone-200 bg-white p-3 shadow-sm min-h-[140px]">
                              <div class="text-xs text-amber-800 font-bold mb-2">落地行动建议</div>
                              <ul class="space-y-2">
                                <li
                                  v-for="a in r.decode?.actionAdvice || []"
                                  :key="a"
                                  class="text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-2 py-2"
                                >
                                  {{ a }}
                                </li>
                              </ul>
                              <div v-if="!(r.decode?.actionAdvice?.length)" class="text-xs text-stone-400 py-2">暂无建议条目</div>
                            </div>
                          </SwiperSlide>
                        </Swiper>
                      </div>
                    </section>

                    <!-- 子区块 B：评论与感悟 -->
                    <section class="py-6">
                      <h4 class="text-xs font-bold text-red-900/90 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span class="h-px w-8 shrink-0 bg-red-200 rounded" />
                        互助评论 · 成长感悟
                        <span class="h-px flex-1 bg-red-200 rounded" />
                      </h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="rounded-2xl border border-stone-200 bg-white p-4 hover:shadow-md transition-shadow">
                          <ReliefCommentsThread :relief-id="r.id" />
                        </div>
                        <div class="rounded-2xl border border-stone-200 bg-white p-4 hover:shadow-md transition-shadow">
                          <div class="text-xs text-stone-500 mb-3 leading-relaxed">成长感悟（发感悟 +8；优质 +20）</div>
                          <div v-if="myReflectionFor(r.id)">
                            <div class="text-sm font-bold text-amber-900">你的感悟已提交</div>
                            <div class="text-xs text-stone-500 mt-1">
                              点赞：{{ myReflectionFor(r.id).likes }} · 状态：{{ myReflectionFor(r.id).quality ? '优质' : '普通' }}
                            </div>
                            <div class="text-sm text-stone-700 whitespace-pre-wrap mt-2 leading-relaxed">{{ myReflectionFor(r.id).text }}</div>
                            <button
                              type="button"
                              v-if="myReflectionFor(r.id)"
                              @click="toggleReflectionLike(myReflectionFor(r.id).id)"
                              class="mt-3 text-xs px-3 py-1.5 rounded-xl border border-stone-200 hover:border-red-900/60 hover:text-red-900 transition-all cursor-pointer bg-white relief-btn"
                            >
                              👍 点赞你的感悟
                            </button>
                          </div>
                          <div v-else>
                            <textarea
                              v-model="reflectionDrafts[r.id]"
                              rows="4"
                              class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-red-900"
                              placeholder="写下你从红色精神中获得的启发，以及下一步怎么做（120-600字）"
                            />
                            <div class="mt-3 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                @click="submitReflection(r.id)"
                                :disabled="reflectionBusyId === r.id"
                                class="px-4 py-2 rounded-xl bg-red-900 text-white text-sm font-bold border-0 cursor-pointer disabled:opacity-50 flex items-center gap-2 relief-btn hover:-translate-y-0.5 hover:shadow-md"
                              >
                                <span
                                  v-if="reflectionBusyId === r.id"
                                  class="inline-block h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                />
                                提交感悟（+8）
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <!-- 子区块 C：成长誓言 -->
                    <section class="py-6 bg-amber-50/30 -mx-4 px-4 border-y border-amber-100/80">
                      <h4 class="text-xs font-bold text-amber-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span class="h-px w-8 shrink-0 bg-amber-200 rounded" />
                        成长誓言（+12）
                        <span class="h-px flex-1 bg-amber-200 rounded" />
                      </h4>
                      <div class="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-sm">
                        <div class="flex items-center justify-between gap-3 flex-wrap mb-2">
                          <p class="text-sm text-stone-600 leading-relaxed">把行动建议转为你可执行的承诺。</p>
                          <span v-if="myOathFor(r.id)" class="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-3 py-1 shrink-0">
                            已立誓
                          </span>
                        </div>
                        <div v-if="myOathFor(r.id)" class="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                          {{ myOathFor(r.id).text }}
                        </div>
                        <div v-else class="mt-2">
                          <textarea
                            v-model="oathDrafts[r.id]"
                            rows="3"
                            class="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-red-900"
                            placeholder="写下你的下一步承诺（80-400字）"
                          />
                          <div class="mt-3 flex justify-end">
                            <button
                              type="button"
                              @click="submitOath(r.id)"
                              :disabled="oathBusyId === r.id"
                              class="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-bold border-0 cursor-pointer disabled:opacity-50 flex items-center gap-2 relief-btn hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <span
                                v-if="oathBusyId === r.id"
                                class="inline-block h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                              />
                              提交誓言（+12）
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>

                    <!-- 子区块 D：公开感悟列表 -->
                    <section class="pt-6 pb-2">
                      <h4 class="text-xs font-bold text-stone-600 uppercase tracking-wide mb-3">公开感悟共鸣</h4>
                      <div class="space-y-3">
                        <div
                          v-for="rf in reflectionsByRelief(r.id)"
                          :key="rf.id"
                          class="rounded-2xl border border-stone-200 bg-white p-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                        >
                          <div class="flex items-start justify-between gap-3 flex-wrap">
                            <div class="text-xs text-stone-500">
                              {{ rf.username || '用户' }} · {{ timeAgo(rf.createdAt) }}
                              <span
                                v-if="rf.quality"
                                class="ml-2 text-amber-900 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 text-[11px] font-bold"
                              >
                                优质
                              </span>
                            </div>
                            <div class="text-xs text-stone-500">👍 {{ rf.likes }}</div>
                          </div>
                          <div class="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed mt-2">{{ rf.text }}</div>
                        </div>
                        <div v-if="reflectionsByRelief(r.id).length === 0" class="text-xs text-stone-400 py-2 text-center">暂无公开感悟</div>
                      </div>
                    </section>
                  </div>
                </article>

                <div ref="loadMoreSentinel" class="h-10 flex items-center justify-center text-xs text-stone-400">
                  <span v-if="loadingMore">加载中…</span>
                  <span v-else-if="publishedReliefsVisible.length >= publishedReliefsFull.length && publishedReliefsFull.length > 0">已加载全部</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的未发布/被拒 -->
    <div v-if="myPending.length" class="ideology-card bg-white border border-stone-200 rounded-2xl p-5 shadow-md">
      <h3 class="font-bold text-stone-900 mb-3">你的提交状态</h3>
      <div class="space-y-3">
        <div
          v-for="p in myPending"
          :key="p.id"
          class="bg-stone-50 border border-stone-200 rounded-2xl p-4 hover:-translate-y-0.5 transition-transform duration-300"
        >
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="text-sm font-bold text-stone-900">{{ p.type }} · {{ p.statusLabel }}</div>
            <div class="text-xs text-stone-500">{{ timeAgo(p.createdAt) }}</div>
          </div>
          <div class="text-sm text-stone-700 mt-2 whitespace-pre-wrap leading-relaxed line-clamp-4">{{ p.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { useIdeologyStore } from '../../stores/ideology'
import ReliefCommentsThread from './ReliefCommentsThread.vue'

const spiritSwiperModules = [Pagination]

const store = useIdeologyStore()

const filterType = ref('')
const form = reactive({
  type: '学业',
  content: '',
  anonymousMode: true,
})
const submitting = ref(false)
const submitErr = ref('')

const submitOpen = ref(true)
const resonanceOpen = ref(true)

const reflectionDrafts = reactive({})
const oathDrafts = reactive({})

const reliefPageSize = 5
const reliefVisibleCount = ref(reliefPageSize)
const loadingMore = ref(false)
const resonanceScrollRef = ref(null)
const loadMoreSentinel = ref(null)

let scrollTick = false
let observer = null

const reflectionBusyId = ref('')
const oathBusyId = ref('')

function lenCN(s) {
  return [...String(s || '')].length
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  return `${d}天前`
}

const publishedReliefsFull = computed(() => {
  const likesMap = new Map()
  for (const lk of store.reliefLikes) likesMap.set(lk.reliefId, (likesMap.get(lk.reliefId) || 0) + 1)
  const base = store.reliefs
    .filter(r => r.humanStatus === 'published')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  const filtered = filterType.value ? base.filter(r => r.type === filterType.value) : base
  return filtered.map(r => ({ ...r, likes: likesMap.get(r.id) || 0 }))
})

const publishedReliefsVisible = computed(() => publishedReliefsFull.value.slice(0, reliefVisibleCount.value))

watch([filterType, () => publishedReliefsFull.value.length], () => {
  reliefVisibleCount.value = reliefPageSize
})

function tryLoadMore() {
  if (loadingMore.value) return
  if (publishedReliefsVisible.value.length >= publishedReliefsFull.value.length) return
  loadingMore.value = true
  requestAnimationFrame(() => {
    reliefVisibleCount.value = Math.min(
      reliefVisibleCount.value + reliefPageSize,
      publishedReliefsFull.value.length,
    )
    loadingMore.value = false
  })
}

function onResonanceScroll(e) {
  const el = e.target
  if (!el || scrollTick) return
  scrollTick = true
  requestAnimationFrame(() => {
    scrollTick = false
    const threshold = 120
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) tryLoadMore()
  })
}

function setupInfiniteObserver() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    entries => {
      for (const en of entries) {
        if (en.isIntersecting) tryLoadMore()
      }
    },
    { root: resonanceScrollRef.value, rootMargin: '80px', threshold: 0 },
  )
  if (loadMoreSentinel.value) observer.observe(loadMoreSentinel.value)
}

onMounted(() => {
  nextTick(() => setupInfiniteObserver())
})

watch([resonanceOpen, publishedReliefsFull], () => {
  nextTick(() => setupInfiniteObserver())
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

const myPending = computed(() => {
  const uId = store.curUserId
  return store.reliefs
    .filter(r => String(r.userId) === String(uId) && r.humanStatus !== 'published')
    .map(r => ({
      ...r,
      statusLabel: r.humanStatus === 'pending' ? '待专家解读' : '未通过审核',
    }))
    .slice(0, 6)
})

async function submitRelief() {
  submitErr.value = ''
  submitting.value = true
  try {
    await store.submitRelief({
      type: form.type,
      content: form.content,
      anonymousMode: form.anonymousMode,
    })
    form.content = ''
    submitErr.value = ''
    alert('提交成功：等待专家解读后将公开展示，并同步积分联动。')
  } catch (e) {
    submitErr.value = e?.message || '提交失败'
  } finally {
    submitting.value = false
  }
}

async function likeRelief(reliefId) {
  try {
    await store.toggleReliefLike({ reliefId })
  } catch (e) {
    alert(e.message || '点赞失败')
  }
}

function reflectionsByRelief(reliefId) {
  return store.reliefReflections.filter(rf => rf.reliefId === reliefId).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

function myReflectionFor(reliefId) {
  return store.reliefReflections.find(rf => rf.reliefId === reliefId && String(rf.userId) === String(store.curUserId)) || null
}

function myOathFor(reliefId) {
  return store.reliefOaths.find(o => o.reliefId === reliefId && String(o.userId) === String(store.curUserId)) || null
}

async function submitReflection(reliefId) {
  reflectionBusyId.value = reliefId
  try {
    await store.submitReliefReflection({ reliefId, text: reflectionDrafts[reliefId] || '' })
    reflectionDrafts[reliefId] = ''
    alert('感悟已提交（+8）。')
  } catch (e) {
    alert(e.message || '提交感悟失败')
  } finally {
    reflectionBusyId.value = ''
  }
}

async function toggleReflectionLike(reflectionId) {
  try {
    await store.toggleReflectionLike({ reflectionId })
  } catch (e) {
    alert(e.message || '点赞失败')
  }
}

async function submitOath(reliefId) {
  oathBusyId.value = reliefId
  try {
    await store.submitOath({ reliefId, text: oathDrafts[reliefId] || '' })
    oathDrafts[reliefId] = ''
    alert('誓言已提交（+12），已同步成长档案。')
  } catch (e) {
    alert(e.message || '提交誓言失败')
  } finally {
    oathBusyId.value = ''
  }
}
</script>

<style scoped>
.ideology-card {
  will-change: transform;
}

.relief-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.animate-fade {
  animation: fade-in 0.3s ease-out;
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

:deep(.spirit-swiper .swiper-pagination-bullet-active) {
  background: #7f1d1d;
}
</style>
