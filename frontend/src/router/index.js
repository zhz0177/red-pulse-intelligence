import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/UserLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('../views/Home.vue') },
      { path: 'map', name: 'Map', component: () => import('../views/map/MapView.vue') },
      { path: 'letter/:martyrId', name: 'Letter', component: () => import('../views/letter/LetterRead.vue') },
      { path: 'photos/:martyrId', name: 'Photos', component: () => import('../views/letter/PhotoGallery.vue') },
      { path: 'gallery', name: 'Gallery', component: () => import('../views/gallery/GalleryView.vue') },
      { path: 'volunteer', name: 'Volunteer', component: () => import('../views/volunteer/TaskList.vue') },
      { path: 'volunteer/:projectId', name: 'TaskDetail', component: () => import('../views/volunteer/TaskDetail.vue') },
      { path: 'profile', name: 'Profile', component: () => import('../views/Profile.vue') },
      { path: 'ai', name: 'AiChat', component: () => import('../views/ai/AiChat.vue') },
      { path: 'game', name: 'GameHub', component: () => import('../views/game/GameHub.vue') },
      { path: 'game/quiz', name: 'QuizEndless', component: () => import('../views/game/QuizEndless.vue') },
      { path: 'game/memory', name: 'MemoryMatch', component: () => import('../views/game/MemoryMatch.vue') },
      { path: 'game/choice', name: 'ChoiceMoment', component: () => import('../views/game/ChoiceMoment.vue') },
      { path: 'shop/dress-up', name: 'DressUpPage', component: () => import('../views/shop/DressUpPage.vue') },
      { path: 'ideology', name: 'IdeologyHall', component: () => import('../views/ideology/IdeologyHall.vue') },
    ]
  },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'users', name: 'UserManage', component: () => import('../views/admin/UserManage.vue') },
      { path: 'projects', name: 'ProjectManage', component: () => import('../views/admin/ProjectManage.vue') },
      { path: 'quiz', name: 'QuizManage', component: () => import('../views/admin/QuizManage.vue') },
      { path: 'choice-feedback', name: 'ChoiceFeedback', component: () => import('../views/admin/ChoiceFeedback.vue') },
      { path: 'ideology-debate', name: 'IdeologyDebateManage', component: () => import('../views/admin/IdeologyDebateManage.vue') },
      { path: 'relief-comments', name: 'ReliefCommentManage', component: () => import('../views/admin/ReliefCommentManage.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // 已登录用户访问登录页 → 直接跳转首页
  if (to.name === 'Login') {
    if (token) return next('/')
    return next()
  }

  if (!token) return next('/login')

  // 管理后台要求 admin 角色
  if (to.meta.requiresAdmin && user.role !== 'admin') {
    return next('/')
  }

  next()
})

export default router
