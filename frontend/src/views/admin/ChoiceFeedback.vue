<template>
  <div>
    <div class="mb-4">
      <h2 class="adm-page-title">小英雄反馈</h2>
      <p class="text-sm text-stone-500 mt-1">查看「抉择时刻」用户提交记录：用户名、英烈、关卡、结果、思考与时间。</p>
    </div>

    <div class="adm-card p-4 mb-4">
      <div class="adm-card-headerline mb-4"></div>
      <div class="flex flex-wrap items-end gap-3">
      <div>
        <label class="block text-xs text-stone-500 mb-1">用户名</label>
        <input v-model="filters.username" placeholder="模糊搜索" class="adm-input w-40 py-1.5" />
      </div>
      <div>
        <label class="block text-xs text-stone-500 mb-1">英烈 martyr_id</label>
        <input v-model.number="filters.martyr_id" type="number" min="0" placeholder="如 1" class="adm-input w-28 py-1.5" />
      </div>
      <div>
        <label class="block text-xs text-stone-500 mb-1">关卡 story_id</label>
        <input v-model.number="filters.story_id" type="number" min="0" class="adm-input w-28 py-1.5" />
      </div>
      <div>
        <label class="block text-xs text-stone-500 mb-1">结果</label>
        <select v-model="filters.all_correct" class="adm-select py-1.5">
          <option value="">全部</option>
          <option value="1">与史实一致</option>
          <option value="0">有待思考</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-stone-500 mb-1">从</label>
        <input v-model="filters.from" type="date" class="adm-input py-1.5" />
      </div>
      <div>
        <label class="block text-xs text-stone-500 mb-1">到</label>
        <input v-model="filters.to" type="date" class="adm-input py-1.5" />
      </div>
      <button type="button" @click="load" class="adm-btn-primary">查询</button>
      <button type="button" @click="resetFilters" class="adm-btn-secondary">重置</button>
      </div>
    </div>

    <div class="text-sm text-stone-500 mb-2">共 <strong>{{ rows.length }}</strong> 条（单次最多 2000 条）</div>

    <div v-if="loading" class="text-center py-12 text-stone-400">加载中...</div>
    <div v-else-if="!rows.length" class="text-center py-12 text-stone-400">暂无记录</div>
    <div v-else class="overflow-x-auto adm-card">
      <table class="min-w-full text-sm text-left">
        <thead class="adm-thead">
          <tr>
            <th class="adm-th whitespace-nowrap">ID</th>
            <th class="adm-th whitespace-nowrap">用户名</th>
            <th class="adm-th whitespace-nowrap">英烈</th>
            <th class="adm-th min-w-[140px]">关卡</th>
            <th class="adm-th whitespace-nowrap">结果</th>
            <th class="adm-th whitespace-nowrap">选项</th>
            <th class="adm-th min-w-[200px]">思考/原因</th>
            <th class="adm-th whitespace-nowrap">时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="adm-tr">
            <td class="px-3 py-2 text-stone-400">{{ r.id }}</td>
            <td class="px-3 py-2 font-medium text-stone-800">{{ r.username }}</td>
            <td class="px-3 py-2">{{ r.martyr_name }} <span class="text-xs text-stone-400">#{{ r.martyr_id }}</span></td>
            <td class="px-3 py-2 text-stone-700">{{ r.story_title }}</td>
            <td class="px-3 py-2">
              <span v-if="r.all_correct" class="adm-badge adm-badge-success">一致</span>
              <span v-else class="adm-badge adm-badge-warn">思考</span>
            </td>
            <td class="px-3 py-2 text-xs font-mono text-stone-600">{{ (r.answers || []).join('→') }}</td>
            <td class="px-3 py-2 text-stone-600 max-w-md">{{ r.reason || '—' }}</td>
            <td class="px-3 py-2 text-xs text-stone-500 whitespace-nowrap">{{ formatTime(r.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getChoiceRecords } from '../../api/choice'

const loading = ref(false)
const rows = ref([])
const filters = ref({
  username: '',
  martyr_id: '',
  story_id: '',
  all_correct: '',
  from: '',
  to: '',
})

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t.replace ? t.replace(' ', 'T') : t)
  if (Number.isNaN(d.getTime())) return t
  return d.toLocaleString('zh-CN', { hour12: false })
}

function buildParams() {
  const p = {}
  if (filters.value.username.trim()) p.username = filters.value.username.trim()
  const mid = filters.value.martyr_id
  if (mid !== '' && mid !== null && !Number.isNaN(Number(mid))) p.martyr_id = Number(mid)
  const sid = filters.value.story_id
  if (sid !== '' && sid !== null && !Number.isNaN(Number(sid))) p.story_id = Number(sid)
  if (filters.value.all_correct !== '') p.all_correct = filters.value.all_correct
  if (filters.value.from) p.from = filters.value.from
  if (filters.value.to) p.to = filters.value.to
  return p
}

async function load() {
  loading.value = true
  try {
    const res = await getChoiceRecords(buildParams())
    rows.value = res.data || []
  } catch (e) {
    console.error(e)
    rows.value = []
    alert(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.value = { username: '', martyr_id: '', story_id: '', all_correct: '', from: '', to: '' }
  load()
}

onMounted(() => load())
</script>
