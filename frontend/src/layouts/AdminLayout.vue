<template>
  <div class="min-h-screen admin-bg-pattern md:flex">
    <!-- 遮罩层 (手机端) -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-30 md:hidden" @click="sidebarOpen = false"></div>

    <!-- 侧边栏 -->
    <aside :class="[
      'fixed left-0 bottom-0 h-screen z-40 w-64 text-white flex flex-col shadow-2xl transform transition-transform duration-300 admin-sidebar-pattern',
      'md:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]" style="background: linear-gradient(180deg, #5A0D0D 0%, #7A1515 35%, #8B1A1A 65%, #6B1111 100%);">

      <!-- Logo区 -->
      <div class="flex-shrink-0 px-5 pt-5 pb-4 border-b border-white/10">
        <router-link to="/admin" class="text-white no-underline flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background: rgba(200,168,75,0.18); border: 1px solid rgba(200,168,75,0.35);">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <polygon points="10,2 12,7.5 18,7.5 13.5,11 15.5,16.5 10,13 4.5,16.5 6.5,11 2,7.5 8,7.5" fill="#C8A84B"/>
            </svg>
          </div>
          <div>
            <div style="font-family:'SimSun','STSong',serif; font-size:15px; font-weight:700; letter-spacing:0.18em; line-height:1.2;">红脉智联</div>
            <div style="font-size:9px; color:rgba(200,168,75,0.7); letter-spacing:0.22em; font-family:'Georgia',serif;">ADMIN CONSOLE</div>
          </div>
        </router-link>
      </div>

      <!-- 菜单 -->
      <nav class="flex-1 overflow-y-auto py-3 space-y-4 px-2">
        <!-- 核心大盘 -->
        <div>
          <div class="px-3 mb-1" style="font-size:10px; letter-spacing:0.18em; color:rgba(200,168,75,0.55); font-weight:600;">核心大盘</div>
          <router-link
            :to="menuGroups[0].path"
            @click="sidebarOpen = false"
            class="admin-nav-link group"
            active-class="admin-nav-active"
          >
            <span v-html="menuGroups[0].svgIcon" class="admin-nav-icon"></span>
            <span>{{ menuGroups[0].label }}</span>
          </router-link>
        </div>

        <!-- 内容管理 -->
        <div>
          <div class="px-3 mb-1" style="font-size:10px; letter-spacing:0.18em; color:rgba(200,168,75,0.55); font-weight:600;">内容管理</div>
          <router-link
            v-for="item in menuGroups.slice(1)"
            :key="item.path"
            :to="item.path"
            @click="sidebarOpen = false"
            class="admin-nav-link group"
            active-class="admin-nav-active"
          >
            <span v-html="item.svgIcon" class="admin-nav-icon"></span>
            <span>{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <!-- 底部分割线 -->
      <div class="mx-4 h-px" style="background: linear-gradient(90deg, transparent, rgba(200,168,75,0.35), transparent);"></div>

      <!-- UserSection -->
      <div class="flex-shrink-0 p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style="background: rgba(200,168,75,0.2); border: 1px solid rgba(200,168,75,0.4); color: #C8A84B;">
            {{ userStore.user?.username?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-medium text-white/90 truncate">{{ userStore.user?.username || '管理员' }}</div>
            <div class="text-xs" style="color: rgba(200,168,75,0.6);">超级管理员</div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-xs no-underline flex items-center gap-1 transition-colors" style="color:rgba(255,255,255,0.45);" onmouseover="this.style.color='rgba(255,255,255,0.8)'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M8,2 L4,6 L8,10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            返回前台
          </router-link>
          <span style="font-size:10px; color:rgba(200,168,75,0.45); letter-spacing:0.05em;">v1.0.0</span>
        </div>
      </div>
    </aside>

    <!-- 主内容 -->
    <div class="flex-1 flex flex-col min-w-0 md:ml-64">
      <!-- 顶部导航栏 -->
      <div class="admin-header-line"></div>
      <header class="h-16 bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-between px-4 md:px-6 border-b border-red-900/10">
        <div class="flex items-center gap-3">
          <button @click="sidebarOpen = true" class="md:hidden bg-transparent border-0 text-stone-700 text-xl cursor-pointer p-1">☰</button>
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 rounded-full" style="background: linear-gradient(180deg, #C0392B, #C8A84B);"></div>
            <h2 class="text-base md:text-lg font-semibold" style="color: #6B1111;">{{ currentTitle }}</h2>
          </div>
        </div>

        <div class="flex items-center gap-2 md:gap-3">
          <!-- 管理员信息 -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style="background: rgba(139,26,26,0.06); border: 1px solid rgba(139,26,26,0.12);">
            <div class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style="background:rgba(192,57,43,0.15); color:#8B1A1A;">{{ userStore.user?.username?.charAt(0)?.toUpperCase() || 'A' }}</div>
            <span class="text-xs font-medium" style="color: #6B1111;">{{ userStore.user?.username }}</span>
          </div>

          <button @click="handleLogout" class="text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-all" style="color:#8B1A1A; border-color:rgba(139,26,26,0.3); background:transparent;" onmouseover="this.style.background='#8B1A1A';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='#8B1A1A'">退出</button>
        </div>
      </header>

      <main class="flex-1 p-3 md:p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const sidebarOpen = ref(false)

const menuGroups = [
  {
    path: '/admin',
    label: '数据大屏',
    svgIcon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="8" width="3" height="7" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="6" y="4" width="3" height="11" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="11" y="1" width="3" height="14" rx="1" fill="currentColor" opacity="0.9"/>
    </svg>`
  },
  {
    path: '/admin/users',
    label: '用户管理',
    svgIcon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
      <path d="M1,14 C1,10.5 3.5,8.5 6,8.5 C8.5,8.5 11,10.5 11,14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M11,4.5 C12.4,4.5 13.5,5.6 13.5,7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M12,10 C13.5,10.5 15,11.8 15,14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`
  },
  {
    path: '/admin/projects',
    label: '项目管理',
    svgIcon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.3"/>
      <path d="M5,6 L11,6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M5,8.5 L11,8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M5,11 L8,11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`
  },
  {
    path: '/admin/quiz',
    label: '题库管理',
    svgIcon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8,2 L10,6 L14.5,6.5 L11,10 L12,14.5 L8,12.5 L4,14.5 L5,10 L1.5,6.5 L6,6 Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`
  },
  {
    path: '/admin/choice-feedback',
    label: '小英雄反馈',
    svgIcon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2,3 Q2,1.5 3.5,1.5 L12.5,1.5 Q14,1.5 14,3 L14,9 Q14,10.5 12.5,10.5 L10,10.5 L8,13 L6,10.5 L3.5,10.5 Q2,10.5 2,9 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M5,5 L11,5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M5,7.5 L9,7.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`
  },
  {
    path: '/admin/ideology-debate',
    label: '思政辩论小广场',
    svgIcon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 6.5 C3 4.6 4.6 3 6.5 3 H9.5 C11.4 3 13 4.6 13 6.5 V9.5 C13 11.4 11.4 13 9.5 13 H6.5 C4.6 13 3 11.4 3 9.5 V6.5Z" stroke="currentColor" stroke-width="1.2"/>
      <path d="M6 7 L10 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M6 9.5 L9 9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`
  },
  {
    path: '/admin/relief-comments',
    label: '解忧站后台',
    svgIcon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 6.2 C2.5 4.2 4.2 2.5 6.2 2.5 H9.8 C11.8 2.5 13.5 4.2 13.5 6.2 V8.3 C13.5 10.3 11.8 12 9.8 12 H6.2 C4.2 12 2.5 10.3 2.5 8.3 V6.2Z" stroke="currentColor" stroke-width="1.2"/>
      <path d="M5 8 L11 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M5.5 5.8 L10.5 5.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`
  },
]

const titleMap = {
  Dashboard: '数据大屏',
  UserManage: '用户管理',
  ProjectManage: '项目管理',
  QuizManage: '题库管理',
  ChoiceFeedback: '小英雄反馈',
  IdeologyDebateManage: '思政辩论小广场',
  ReliefCommentManage: '解忧站后台',
}
const currentTitle = computed(() => titleMap[route.name] || '管理后台')

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>
