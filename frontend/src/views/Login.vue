<template>
  <div class="min-h-screen bg-stone-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🏛</div>
        <h1 class="text-3xl font-bold text-red-900 tracking-wider">红脉智联</h1>
        <p class="text-stone-500 mt-2 text-sm">红色文化传承 · 志愿服务平台</p>
      </div>
      <div class="bg-white rounded-xl shadow-lg p-8 border border-amber-700/20">
        <div class="flex mb-6 border-b border-stone-200">
          <button
            @click="isLogin = true"
            :class="['flex-1 pb-3 text-sm font-medium transition border-b-2 bg-transparent cursor-pointer', isLogin ? 'text-red-900 border-red-900' : 'text-stone-400 border-transparent']"
          >登录</button>
          <button
            @click="isLogin = false"
            :class="['flex-1 pb-3 text-sm font-medium transition border-b-2 bg-transparent cursor-pointer', !isLogin ? 'text-red-900 border-red-900' : 'text-stone-400 border-transparent']"
          >注册</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-stone-600 mb-1">用户名</label>
              <input v-model="form.username" type="text" required
                class="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900 text-sm" placeholder="请输入用户名" />
            </div>
            <div>
              <label class="block text-sm text-stone-600 mb-1">密码</label>
              <input v-model="form.password" type="password" required
                class="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900 text-sm" placeholder="请输入密码" />
            </div>
            <div v-if="!isLogin">
              <label class="block text-sm text-stone-600 mb-1">确认密码</label>
              <input v-model="form.confirmPassword" type="password"
                class="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900 text-sm" placeholder="请再次输入密码" />
            </div>
          </div>
          <p v-if="error" class="text-red-500 text-sm mt-3">{{ error }}</p>
          <button type="submit" :disabled="loading"
            class="w-full mt-6 btn-red text-center disabled:opacity-50">
            {{ loading ? '处理中...' : (isLogin ? '登 录' : '注 册') }}
          </button>
        </form>
      </div>
      <p class="text-center text-stone-400 text-xs mt-6">红脉智联 · 青年红色筑梦之旅</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')
const form = reactive({ username: '', password: '', confirmPassword: '' })

async function handleSubmit() {
  error.value = ''

  if (!form.username.trim() || !form.password.trim()) {
    error.value = '请输入用户名和密码'
    return
  }
  if (!isLogin.value && form.password !== form.confirmPassword) {
    error.value = '两次密码不一致'
    return
  }
  if (!isLogin.value && form.password.length < 6) {
    error.value = '密码至少6位'
    return
  }

  loading.value = true
  try {
    if (isLogin.value) {
      await userStore.login({ username: form.username, password: form.password })
    } else {
      await userStore.register({ username: form.username, password: form.password })
    }
    router.push(userStore.user?.role === 'admin' ? '/admin' : '/')
  } catch (e) {
    error.value = e.message || e.msg || (isLogin.value ? '登录失败，用户名或密码错误' : '注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>
