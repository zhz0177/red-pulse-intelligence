<template>
  <div class="min-h-screen" style="background: var(--paper-warm);">
    <!-- 顶部导航 -->
    <nav class="text-white shadow-lg relative z-40" style="background: linear-gradient(135deg, #6B1111 0%, #8B1A1A 50%, #7A1515 100%); border-bottom: 1px solid rgba(200,168,75,0.3);">
      <!-- 顶部金线装饰 -->
      <div style="height:2px; background: linear-gradient(90deg, transparent, #C8A84B, #E8C96B, #C8A84B, transparent);"></div>

      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2.5 text-white no-underline flex-shrink-0">
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
            <polygon points="16,3 19,11.5 28,11.5 21,17 23.5,25.5 16,20.5 8.5,25.5 11,17 4,11.5 13,11.5" fill="#C8A84B" opacity="0.95"/>
            <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(200,168,75,0.3)" stroke-width="1"/>
          </svg>
          <div>
            <div style="font-family: 'SimSun','STSong',serif; font-size: 18px; font-weight: 700; letter-spacing: 0.22em; line-height: 1.2;">红脉智联</div>
            <div style="color: rgba(200,168,75,0.75); font-size: 9px; letter-spacing: 0.28em; font-family: 'Georgia',serif;">RED CULTURAL HERITAGE</div>
          </div>
        </router-link>

        <!-- 装饰分隔线 -->
        <div class="hidden md:block h-7 w-px flex-shrink-0" style="background: linear-gradient(180deg, transparent, rgba(200,168,75,0.45), transparent);"></div>

        <!-- 桌面导航 -->
        <div class="hidden md:flex items-center gap-0.5 flex-1">
          <router-link to="/map" class="nav-link" active-class="nav-link-active">
            <span class="nav-icon">🗺</span>红迹地图
          </router-link>
          <router-link to="/gallery" class="nav-link" active-class="nav-link-active">
            <span class="nav-icon">🎞</span>珍贵影像
          </router-link>
          <router-link to="/volunteer" class="nav-link" active-class="nav-link-active">
            <span class="nav-icon">✊</span>志愿服务
          </router-link>
          <router-link to="/game" class="nav-link" active-class="nav-link-active">
            <span class="nav-icon">⚡</span>知识闯关
          </router-link>
          <router-link to="/ideology" class="nav-link" active-class="nav-link-active">
            <span class="nav-icon">🗣️</span>思政
          </router-link>
          <router-link to="/ai" class="nav-link" active-class="nav-link-active">
            <span class="nav-icon">🤖</span>AI 助手
          </router-link>
          <template v-if="userStore.isLoggedIn">
            <button @click="showShop = true" class="nav-link nav-btn">
              <span class="nav-icon">🏪</span>传承商城
              <span class="beans-badge">{{ shopStore.beans }}</span>
            </button>
          </template>
        </div>

        <!-- 右侧用户区 -->
        <div class="hidden md:flex items-center gap-2 flex-shrink-0">
          <template v-if="userStore.isLoggedIn">
            <router-link to="/profile" class="nav-link" active-class="nav-link-active">
              <span class="nav-icon">👤</span>个人中心
            </router-link>
            <button @click="handleLogout" class="nav-link nav-btn text-sm">退出</button>
            <router-link v-if="userStore.isAdmin" to="/admin" class="admin-btn no-underline">管理后台</router-link>
          </template>
          <router-link v-else to="/login" class="login-btn no-underline">登录 / 注册</router-link>
        </div>

        <!-- 汉堡按钮 (手机端) -->
        <button @click="menuOpen = !menuOpen" class="md:hidden ml-auto bg-transparent border-0 text-white text-xl cursor-pointer p-1">
          <span v-if="!menuOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>

      <!-- 底部装饰线 -->
      <div style="height:1px; background: linear-gradient(90deg, transparent, rgba(200,168,75,0.35), transparent);"></div>

      <!-- 手机端下拉菜单 -->
      <transition name="dropdown">
        <div v-if="menuOpen" class="md:hidden" style="background: linear-gradient(180deg, #7A1515 0%, #6B1111 100%); border-top: 1px solid rgba(200,168,75,0.2);">
          <div class="flex flex-col">
            <router-link to="/map" @click="menuOpen = false" class="mobile-nav-link">🗺 红迹地图</router-link>
            <router-link to="/gallery" @click="menuOpen = false" class="mobile-nav-link">🎞 珍贵影像</router-link>
            <router-link to="/volunteer" @click="menuOpen = false" class="mobile-nav-link">✊ 志愿服务</router-link>
            <router-link to="/game" @click="menuOpen = false" class="mobile-nav-link">⚡ 知识闯关</router-link>
              <router-link to="/ideology" @click="menuOpen = false" class="mobile-nav-link">🗣️ 思政</router-link>
            <router-link to="/ai" @click="menuOpen = false" class="mobile-nav-link">🤖 AI 助手</router-link>
            <template v-if="userStore.isLoggedIn">
              <button @click="showShop = true; menuOpen = false" class="mobile-nav-link text-left bg-transparent border-0 cursor-pointer flex items-center gap-2">
                🏪 传承商城
                <span class="beans-badge">{{ shopStore.beans }}</span>
              </button>
              <router-link to="/profile" @click="menuOpen = false" class="mobile-nav-link">👤 个人中心</router-link>
              <button @click="handleLogout(); menuOpen = false" class="mobile-nav-link text-left bg-transparent border-0 cursor-pointer w-full">🚪 退出登录</button>
              <router-link v-if="userStore.isAdmin" to="/admin" @click="menuOpen = false" class="mobile-nav-link" style="color: #E8C96B;">⚙ 管理后台</router-link>
            </template>
            <router-link v-else to="/login" @click="menuOpen = false" class="mobile-nav-link font-medium">🔑 登录 / 注册</router-link>
          </div>
        </div>
      </transition>
    </nav>

    <!-- 主内容 -->
    <main>
      <router-view />
    </main>
  </div>

  <!-- 商城弹窗 -->
  <ShopModal v-if="showShop" @close="showShop = false" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { useShopStore } from '../stores/shop'
import { useRouter } from 'vue-router'
import ShopModal from '../components/ShopModal.vue'

const userStore = useUserStore()
const shopStore = useShopStore()
const router = useRouter()
const menuOpen = ref(false)
const showShop = ref(false)

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await shopStore.refreshAll()
  }
})

watch(showShop, async (v) => {
  if (v) {
    await shopStore.refreshAll()
  }
})

function handleLogout() {
  userStore.logout()
  shopStore.reset()
  router.push('/')
}
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }

/* 桌面导航链接 */
.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}
.nav-btn {
  background: transparent;
  border: 0;
  cursor: pointer;
}
.nav-icon {
  font-size: 13px;
  opacity: 0.85;
}
.nav-link:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}
.nav-link-active {
  color: #E8C96B !important;
  background: rgba(200,168,75,0.13) !important;
  font-weight: 600;
}
.nav-link-active::after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: 18%;
  width: 64%;
  height: 1.5px;
  border-radius: 1px;
  background: linear-gradient(90deg, transparent, #C8A84B, transparent);
}

/* 传承豆徽标 */
.beans-badge {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
  background: rgba(200,168,75,0.22);
  color: #E8C96B;
  border: 1px solid rgba(200,168,75,0.38);
  line-height: 1.4;
}

/* 登录按钮 */
.login-btn {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  color: #6B1111;
  background: linear-gradient(135deg, #F5EFD8, #EDE0B8);
  border: 1px solid rgba(200,168,75,0.5);
  letter-spacing: 0.06em;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.login-btn:hover {
  background: linear-gradient(135deg, #EDE0B8, #E0D09A);
  box-shadow: 0 2px 8px rgba(200,168,75,0.3);
}

/* 管理后台按钮 */
.admin-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
  color: #C8A84B;
  background: rgba(200,168,75,0.12);
  border: 1px solid rgba(200,168,75,0.35);
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.admin-btn:hover {
  background: rgba(200,168,75,0.22);
  color: #E8C96B;
}

/* 手机端菜单 */
.mobile-nav-link {
  display: block;
  padding: 11px 20px;
  color: rgba(255,255,255,0.82);
  text-decoration: none;
  font-size: 14px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 500;
  letter-spacing: 0.06em;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: all 0.18s ease;
}
.mobile-nav-link:hover, .mobile-nav-link:active {
  color: #fff;
  background: rgba(255,255,255,0.07);
  padding-left: 26px;
}
</style>
