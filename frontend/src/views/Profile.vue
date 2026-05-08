<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">

    <!-- 用户信息卡片 -->
    <div class="bg-white rounded-xl shadow-md border border-amber-700/20 overflow-hidden">
      <div class="bg-red-900 p-4 md:p-6 flex items-center gap-4 md:gap-5">
        <div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl md:text-2xl font-bold flex-shrink-0">
          {{ userInfo.username?.charAt(0) || '?' }}
        </div>
        <div class="flex-1 text-white">
          <h2 class="text-lg md:text-xl font-bold">{{ userInfo.username }}</h2>
          <div class="flex items-center gap-3 mt-1 text-sm text-white/70">
            <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">{{ userInfo.role === 'admin' ? '管理员' : '志愿者' }}</span>
            <span>注册于 {{ formatDate(userInfo.createdAt) }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-2 md:mt-0">
          <button @click="showContactModal = true" class="text-xs px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition border-0 cursor-pointer">联系方式</button>
          <button @click="showPwdModal = true" class="text-xs px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition border-0 cursor-pointer">修改密码</button>
        </div>
      </div>
      <div class="px-4 md:px-6 py-3 flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-6 text-sm text-stone-500 border-t border-stone-100 bg-stone-50">
        <span>手机：{{ userInfo.phone || '未绑定' }}</span>
        <span>微信：{{ userInfo.wechat || '未绑定' }}</span>
        <span class="md:ml-auto">累计提交 <strong class="text-red-900">{{ mySubmissions.length }}</strong> 次</span>
      </div>
    </div>

    <!-- 荣誉勋章墙 -->
    <div class="card-paper p-6">
      <h3 class="text-base font-bold text-stone-800 mb-4">荣誉勋章墙</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <div v-for="medal in medals" :key="medal.category"
          :class="['p-4 text-center transition-all duration-400 cursor-default', medal.level > 0 ? 'medal-unlocked' : 'medal-locked']">
          <div class="text-3xl mb-2">{{ medal.icon }}</div>
          <div :class="['text-xs font-bold mb-1', medal.level > 0 ? 'text-amber-800' : 'text-stone-400']">{{ medal.levelText }}</div>
          <div :class="['text-sm font-medium', medal.level > 0 ? 'text-amber-900' : 'text-stone-500']">{{ medal.category }}</div>
          <div class="text-xs mt-1" :class="medal.level > 0 ? 'text-amber-700' : 'text-stone-400'">{{ medal.isQuiz ? `最高连对 ${medal.count} 题` : `完成 ${medal.count} 个项目` }}</div>
          <div class="mt-2 flex justify-center gap-0.5">
            <span v-for="s in 3" :key="s" :class="['inline-block w-2 h-2 rounded-full', s <= medal.level ? 'bg-amber-500' : 'bg-stone-300']"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 正在进行的任务 -->
    <div class="bg-white rounded-xl shadow-md border border-amber-700/20 p-6">
      <h3 class="text-base font-bold text-stone-800 mb-4">正在进行的任务</h3>
      <div v-if="inProgressTasks.length" class="space-y-3">
        <div v-for="task in inProgressTasks" :key="task.id" class="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
          <div class="flex items-center gap-3">
            <span class="text-lg">{{ categoryIcon[task.category] || '📋' }}</span>
            <div>
              <div class="text-sm font-medium text-stone-800">{{ task.title }}</div>
              <div class="text-xs text-stone-400">{{ task.category }}</div>
            </div>
          </div>
          <router-link :to="`/volunteer/${task.id}`" class="text-xs px-3 py-1.5 bg-red-900 text-white rounded-lg no-underline hover:bg-red-800 transition">
            去提交
          </router-link>
        </div>
      </div>
      <div v-else class="text-center py-6 text-stone-400 text-sm">暂无进行中的任务，去 <router-link to="/volunteer" class="text-red-900 no-underline font-medium">志愿服务</router-link> 接单吧</div>
    </div>

    <!-- 我的提交记录 -->
    <div class="bg-white rounded-xl shadow-md border border-amber-700/20 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-stone-800">我的提交记录</h3>
        <div class="flex flex-wrap gap-2">
          <button v-for="f in statusFilters" :key="f.value" @click="filterStatus = f.value"
            :class="['text-xs px-3 py-1 rounded-full border cursor-pointer transition',
              filterStatus === f.value ? 'bg-red-900 text-white border-red-900' : 'bg-white text-stone-500 border-stone-300 hover:border-red-900']">
            {{ f.label }}
          </button>
        </div>
      </div>
      <div v-if="filteredSubmissions.length" class="space-y-3">
        <div v-for="sub in filteredSubmissions" :key="sub.id" class="p-4 rounded-lg border border-stone-200 bg-stone-50">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-sm">{{ categoryIcon[sub.category] || '📋' }}</span>
              <span class="text-sm font-medium text-stone-800">{{ sub.projectTitle }}</span>
            </div>
            <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', statusClass[sub.reviewStatus]]">
              {{ sub.reviewStatus }}
            </span>
          </div>
          <p class="text-xs text-stone-500 mb-2 line-clamp-1">{{ sub.insight }}</p>
          <div class="flex items-center justify-between text-xs text-stone-400">
            <span>{{ formatDate(sub.createdAt) }}</span>
            <div class="flex gap-2">
              <!-- 驳回显示修改意见 -->
              <span v-if="sub.reviewStatus === '驳回' && sub.rejectReason" class="text-red-600">
                修改意见：{{ sub.rejectReason }}
              </span>
              <!-- 通过显示证书下载 -->
              <button v-if="sub.reviewStatus === '通过' && sub.certificateCode"
                @click="downloadCert(sub)"
                class="text-red-900 font-medium bg-transparent border-0 cursor-pointer hover:underline text-xs">
                下载证书
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-6 text-stone-400 text-sm">暂无提交记录</div>
    </div>

    <!-- 我的服务地图 -->
    <div class="bg-white rounded-xl shadow-md border border-amber-700/20 p-6">
      <h3 class="text-base font-bold text-stone-800 mb-4">我的服务地图</h3>
      <div id="profile-map" class="w-full h-72 rounded-lg border border-stone-200"></div>
      <p class="text-xs text-stone-400 mt-2 text-center">已服务 {{ servicePoints.length }} 个红色坐标点</p>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showPwdModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showPwdModal = false">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-red-900 mb-4">修改密码</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-stone-600 mb-1">当前密码</label>
            <input v-model="pwdForm.oldPassword" type="password" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-red-900" placeholder="请输入当前密码" />
          </div>
          <div>
            <label class="block text-sm text-stone-600 mb-1">新密码</label>
            <input v-model="pwdForm.newPassword" type="password" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-red-900" placeholder="至少6位" />
          </div>
          <div>
            <label class="block text-sm text-stone-600 mb-1">确认新密码</label>
            <input v-model="pwdForm.confirmPassword" type="password" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-red-900" placeholder="再次输入新密码" />
          </div>
        </div>
        <p v-if="pwdError" class="text-red-500 text-sm mt-3">{{ pwdError }}</p>
        <p v-if="pwdSuccess" class="text-green-600 text-sm mt-3">{{ pwdSuccess }}</p>
        <div class="flex gap-3 mt-6">
          <button @click="showPwdModal = false" class="flex-1 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 cursor-pointer bg-white">取消</button>
          <button @click="handleChangePwd" :disabled="pwdLoading" class="flex-1 py-2 bg-red-900 text-white rounded-lg text-sm hover:bg-red-800 transition border-0 cursor-pointer disabled:opacity-50">
            {{ pwdLoading ? '提交中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 联系方式弹窗 -->
    <div v-if="showContactModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showContactModal = false">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-red-900 mb-4">绑定联系方式</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-stone-600 mb-1">手机号</label>
            <input v-model="contactForm.phone" type="text" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-red-900" placeholder="请输入手机号" />
          </div>
          <div>
            <label class="block text-sm text-stone-600 mb-1">微信号</label>
            <input v-model="contactForm.wechat" type="text" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-red-900" placeholder="请输入微信号" />
          </div>
        </div>
        <p v-if="contactMsg" :class="['text-sm mt-3', contactMsg.includes('成功') ? 'text-green-600' : 'text-red-500']">{{ contactMsg }}</p>
        <div class="flex gap-3 mt-6">
          <button @click="showContactModal = false" class="flex-1 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 cursor-pointer bg-white">取消</button>
          <button @click="handleUpdateContact" :disabled="contactLoading" class="flex-1 py-2 bg-red-900 text-white rounded-lg text-sm hover:bg-red-800 transition border-0 cursor-pointer disabled:opacity-50">
            {{ contactLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 证书弹窗 -->
    <div v-if="showCertModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showCertModal = false">
      <CertificatePreview :data="certData" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { getUserInfo, changePassword, updateProfile, getMySubmissions, getMyProjects } from '../api/user'
import { getMyScore } from '../api/quiz'
import CertificatePreview from '../components/CertificatePreview.vue'
import { useShopStore } from '../stores/shop'

const userInfo = ref({ username: '', role: '', createdAt: '', phone: '', wechat: '' })
const mySubmissions = ref([])
const myProjects = ref([])
const filterStatus = ref('')
const showPwdModal = ref(false)
const showContactModal = ref(false)
const showCertModal = ref(false)
const certData = ref({})
const pwdLoading = ref(false)
const pwdError = ref('')
const pwdSuccess = ref('')
const contactLoading = ref(false)
const contactMsg = ref('')
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const contactForm = reactive({ phone: '', wechat: '' })

let miniMap = null
const quizBestStreak = ref(0)
const shopStore = useShopStore()

const categoryIcon = { '照片修复': '🖼️', '老兵采访': '🎙️', '文物保护': '🏛️', '资料整理': '📚' }

const statusFilters = [
  { label: '全部', value: '' },
  { label: '待审核', value: '待审' },
  { label: '已通过', value: '通过' },
  { label: '已驳回', value: '驳回' },
]

const statusClass = {
  '待审': 'bg-amber-100 text-amber-700',
  '通过': 'bg-green-100 text-green-700',
  '驳回': 'bg-red-100 text-red-700',
}

// 项目→烈士坐标映射（用于迷你地图）
const projectLocationMap = {
  1:[116.40,39.90], 2:[127.12,38.32], 3:[117.73,41.31], 4:[108.94,34.26],
  5:[106.55,29.56], 6:[118.77,32.06], 7:[113.38,36.87], 8:[126.81,42.38],
  9:[104.07,30.67], 10:[118.79,32.06], 11:[126.65,45.75], 12:[110.35,20.02],
  13:[126.65,45.75], 14:[109.49,36.60], 15:[118.77,32.06], 16:[117.73,41.31],
  17:[115.50,39.35], 18:[113.38,36.87], 19:[115.89,28.68], 20:[118.91,39.42],
  21:[109.49,36.60], 22:[115.50,39.35], 23:[121.47,31.23], 24:[111.00,25.50],
  25:[109.49,36.60], 26:[113.38,36.87], 27:[115.89,28.68], 28:[116.40,39.90],
}

const filteredSubmissions = computed(() => {
  if (!filterStatus.value) return mySubmissions.value
  return mySubmissions.value.filter(s => s.reviewStatus === filterStatus.value)
})

// 已通过的提交所对应的项目位置（去重）
const servicePoints = computed(() => {
  const seen = new Set()
  return mySubmissions.value
    .filter(s => s.reviewStatus === '通过' && projectLocationMap[s.project_id])
    .filter(s => { const k = s.project_id; if (seen.has(k)) return false; seen.add(k); return true })
    .map(s => ({ projectId: s.project_id, title: s.projectTitle, lnglat: projectLocationMap[s.project_id] }))
})

// 勋章计算
const medals = computed(() => {
  const counts = { '照片修复': 0, '老兵采访': 0, '文物保护': 0, '资料整理': 0 }
  mySubmissions.value.forEach(s => { if (s.reviewStatus === '通过' && counts[s.category] !== undefined) counts[s.category]++ })

  const quizStreak = quizBestStreak.value
  const quizLit = quizStreak >= 30
  const quizMedal = {
    category: '百题斩达人',
    icon: '⚡',
    count: quizStreak,
    level: quizLit ? 3 : 0,
    levelText: quizLit ? '已点亮' : '未点亮',
    levelColor: quizLit ? 'text-amber-600' : 'text-stone-400',
    dotColor: quizLit ? 'bg-amber-500' : 'bg-stone-200',
    isQuiz: true,
  }

  return [
    { category: '照片修复', icon: '🖼️', count: counts['照片修复'], ...medalLevel(counts['照片修复']) },
    { category: '老兵采访', icon: '🎙️', count: counts['老兵采访'], ...medalLevel(counts['老兵采访']) },
    { category: '文物保护', icon: '🏛️', count: counts['文物保护'], ...medalLevel(counts['文物保护']) },
    { category: '资料整理', icon: '📚', count: counts['资料整理'], ...medalLevel(counts['资料整理']) },
    quizMedal,
  ]
})

function medalLevel(count) {
  if (count >= 6) return { level: 3, levelText: '金牌勋章', levelColor: 'text-amber-600', dotColor: 'bg-amber-500' }
  if (count >= 3) return { level: 2, levelText: '银牌勋章', levelColor: 'text-stone-500', dotColor: 'bg-stone-400' }
  if (count >= 1) return { level: 1, levelText: '铜牌勋章', levelColor: 'text-amber-800', dotColor: 'bg-amber-700' }
  return { level: 0, levelText: '未点亮', levelColor: 'text-stone-400', dotColor: 'bg-stone-200' }
}

async function earnNewMedalsIfNeeded() {
  const LS_KEY = 'medal-lit-levels-v1'
  let saved = {}
  try {
    saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}
  } catch {}

  // 每次登录/刷新后，只对“由未点亮 → 点亮”的勋章发放奖励
  for (const m of medals.value) {
    const prev = saved[m.category] ? Number(saved[m.category]) : 0
    const now = Number(m.level || 0)
    if (prev <= 0 && now > 0) {
      try { await shopStore.earn('medal_light') } catch {}
      saved[m.category] = now
    }
  }

  try { localStorage.setItem(LS_KEY, JSON.stringify(saved)) } catch {}
}

// 正在进行中的任务（有提交但所有提交都不是"通过"的项目，视为进行中）
const inProgressTasks = computed(() => {
  const passedProjects = new Set(mySubmissions.value.filter(s => s.reviewStatus === '通过').map(s => s.project_id))
  return myProjects.value.filter(p => !passedProjects.has(p.id))
})

function formatDate(dt) {
  if (!dt) return '-'
  return dt.substring(0, 10)
}

onMounted(async () => {
  try {
    const [infoRes, subRes, projRes] = await Promise.all([getUserInfo(), getMySubmissions(), getMyProjects()])
    userInfo.value = infoRes.data || {}
    mySubmissions.value = subRes.data || []
    myProjects.value = projRes.data || []
    contactForm.phone = userInfo.value.phone || ''
    contactForm.wechat = userInfo.value.wechat || ''
  } catch { /* fallback: use localStorage user */
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    userInfo.value = { username: u.username || '', role: u.role || '', createdAt: '', phone: '', wechat: '' }
  }
  // 获取答题最高分
  try {
    const scoreRes = await getMyScore()
    quizBestStreak.value = scoreRes.data?.best_streak || 0
  } catch { quizBestStreak.value = 0 }
  await nextTick()
  await earnNewMedalsIfNeeded()
  initMiniMap()
})

async function initMiniMap() {
  try {
    const AMapLoader = (await import('@amap/amap-jsapi-loader')).default
    const AMap = await AMapLoader.load({ key: import.meta.env.VITE_AMAP_KEY, version: '2.0' })
    miniMap = new AMap.Map('profile-map', {
      viewMode: '2D', zoom: 4, center: [104.07, 35.44],
      mapStyle: 'amap://styles/whitesmoke'
    })
    // 标记服务过的坐标点
    servicePoints.value.forEach(pt => {
      const marker = new AMap.Marker({
        position: pt.lnglat,
        content: `<div style="background:#7f1d1d;color:#fff;padding:2px 8px;border-radius:12px;font-size:10px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);border:1px solid #b45309;">
          <span style="display:inline-block;width:4px;height:4px;background:#f59e0b;border-radius:50%;margin-right:3px;vertical-align:middle;"></span>${pt.title}
        </div>`,
        offset: new AMap.Pixel(-30, -10),
      })
      miniMap.add(marker)
    })
  } catch (e) {
    console.warn('迷你地图加载失败:', e)
  }
}

async function handleChangePwd() {
  pwdError.value = ''
  pwdSuccess.value = ''
  if (!pwdForm.oldPassword) { pwdError.value = '请输入当前密码'; return }
  if (!pwdForm.newPassword) { pwdError.value = '请输入新密码'; return }
  if (pwdForm.newPassword.length < 6) { pwdError.value = '新密码至少6位'; return }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) { pwdError.value = '两次密码不一致'; return }
  pwdLoading.value = true
  try {
    await changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    pwdSuccess.value = '密码修改成功，请重新登录'
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
  } catch (e) {
    pwdError.value = e.msg || e.message || '修改失败'
  } finally {
    pwdLoading.value = false
  }
}

async function handleUpdateContact() {
  contactMsg.value = ''
  contactLoading.value = true
  try {
    await updateProfile({ phone: contactForm.phone, wechat: contactForm.wechat })
    userInfo.value.phone = contactForm.phone
    userInfo.value.wechat = contactForm.wechat
    contactMsg.value = '更新成功'
  } catch (e) {
    contactMsg.value = e.msg || e.message || '更新失败'
  } finally {
    contactLoading.value = false
  }
}

function downloadCert(sub) {
  certData.value = {
    username: userInfo.value.username,
    projectTitle: sub.projectTitle,
    hours: 8,
    certificateCode: sub.certificateCode,
    date: formatDate(sub.createdAt),
  }
  showCertModal.value = true
}
</script>

<style scoped>
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
</style>
