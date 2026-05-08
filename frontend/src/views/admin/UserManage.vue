<template>
  <div>
    <!-- 顶部操作栏 -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-2">
      <div>
        <h2 class="adm-page-title">用户管理</h2>
        <div class="text-sm text-stone-500 mt-1">统一管理管理员与志愿者账号信息</div>
      </div>
      <button @click="openCreate" class="adm-btn-primary">
        + 新增用户
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="adm-card p-4 md:p-5 mb-4 md:mb-6">
      <div class="adm-card-headerline mb-4"></div>
      <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
        <div class="flex-1 relative">
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索用户名..."
          class="adm-input pl-9 pr-4"
        />
        <span class="absolute left-3 top-2.5 text-stone-400 text-sm">🔍</span>
        </div>
        <select v-model="filterRole" class="adm-select w-full md:w-52">
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="volunteer">志愿者</option>
        </select>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
      <div class="adm-card p-4">
        <div class="flex items-center justify-between">
          <div class="text-xs text-slate-500 tracking-wider font-semibold">总用户数</div>
          <span class="adm-badge" style="background: rgba(200,16,46,0.06); border-color: rgba(200,16,46,0.14);">ALL</span>
        </div>
        <div class="mt-2 text-3xl font-extrabold" style="color: var(--brand-red);">{{ users.length }}</div>
        <div class="mt-2 text-xs text-slate-500">包含管理员与志愿者</div>
      </div>
      <div class="adm-card p-4">
        <div class="flex items-center justify-between">
          <div class="text-xs text-slate-500 tracking-wider font-semibold">管理员</div>
          <span class="adm-badge adm-badge-admin">ADMIN</span>
        </div>
        <div class="mt-2 text-3xl font-extrabold" style="color: #8A0F22;">{{ users.filter(u => u.role === 'admin').length }}</div>
        <div class="mt-2 text-xs text-slate-500">拥有后台管理权限</div>
      </div>
      <div class="adm-card p-4">
        <div class="flex items-center justify-between">
          <div class="text-xs text-slate-500 tracking-wider font-semibold">志愿者</div>
          <span class="adm-badge adm-badge-volunteer">VOL</span>
        </div>
        <div class="mt-2 text-3xl font-extrabold" style="color: rgba(31,41,55,0.92);">{{ users.filter(u => u.role === 'volunteer').length }}</div>
        <div class="mt-2 text-xs text-slate-500">参与志愿服务与提交</div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="adm-card overflow-x-auto">
      <div class="adm-card-headerline"></div>
      <table class="adm-table">
        <thead>
          <tr class="adm-thead">
            <th class="adm-th">ID</th>
            <th class="adm-th">用户名</th>
            <th class="adm-th">角色</th>
            <th class="adm-th">提交数</th>
            <th class="adm-th">注册时间</th>
            <th class="adm-th text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id" class="adm-tr">
            <td class="px-5 py-4 text-sm text-slate-500">{{ u.id }}</td>
            <td class="px-5 py-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                  style="background: var(--brand-red-soft); color: var(--brand-red); border: 1px solid var(--brand-line);"
                >
                  {{ u.username.charAt(0) }}
                </div>
                <span class="text-sm font-semibold text-slate-800">{{ u.username }}</span>
              </div>
            </td>
            <td class="px-5 py-4">
              <span :class="['adm-badge', u.role === 'admin' ? 'adm-badge-admin' : 'adm-badge-volunteer']">
                {{ u.role === 'admin' ? '管理员' : '志愿者' }}
              </span>
            </td>
            <td class="px-5 py-4 text-sm text-slate-700">{{ u.orderCount || 0 }}</td>
            <td class="px-5 py-4 text-sm text-slate-500">{{ formatDate(u.createdAt) }}</td>
            <td class="px-5 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEdit(u)" class="adm-btn-secondary px-3 py-1.5 text-xs">
                  编辑
                </button>
                <button
                  v-if="u.role !== 'admin'"
                  @click="confirmDelete(u)"
                  class="adm-btn-danger px-3 py-1.5 text-xs"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredUsers.length">
            <td colspan="6" class="px-5 py-10 text-center text-stone-400 text-sm">暂无匹配用户</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 text-sm text-stone-400">共 {{ filteredUsers.length }} 个用户</div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-5 text-white" style="background: linear-gradient(135deg, var(--brand-red), #8A0F22);">
          <div class="text-base font-bold tracking-wide">{{ isEdit ? '编辑用户' : '新增用户' }}</div>
          <div class="text-xs text-white/80 mt-1">请确认信息后保存</div>
        </div>
        <div class="p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-stone-600 mb-1">用户名</label>
            <input v-model="formData.username" type="text"
              class="adm-input"
              placeholder="请输入用户名" />
          </div>
          <div>
            <label class="block text-sm text-stone-600 mb-1">
              密码
              <span v-if="isEdit" class="text-stone-400 font-normal">（留空则不修改）</span>
            </label>
            <input v-model="formData.password" type="password"
              class="adm-input"
              :placeholder="isEdit ? '留空不修改密码' : '请输入密码（至少6位）'" />
          </div>
          <div>
            <label class="block text-sm text-stone-600 mb-1">角色</label>
            <select v-model="formData.role"
              class="adm-select">
              <option value="volunteer">志愿者</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>
        <p v-if="formError" class="text-red-500 text-sm mt-3">{{ formError }}</p>
        <div class="flex gap-3 mt-6">
          <button @click="showModal = false" class="adm-btn-secondary flex-1">取消</button>
          <button @click="handleSave" :disabled="saving" class="adm-btn-primary flex-1 disabled:opacity-50">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showDeleteConfirm = false">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div class="text-4xl mb-3">⚠️</div>
        <h3 class="text-lg font-bold text-stone-800 mb-2">确认删除</h3>
        <p class="text-sm text-stone-500 mb-6">确定要删除用户 <strong class="text-red-900">{{ deleteTarget?.username }}</strong> 吗？此操作不可撤销。</p>
        <div class="flex gap-3">
          <button @click="showDeleteConfirm = false" class="adm-btn-secondary flex-1">取消</button>
          <button @click="handleDelete" :disabled="deleting" class="adm-btn-danger flex-1 disabled:opacity-50">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getUsers, createUser, updateUser, deleteUser } from '../../api/project'

const users = ref([])
const searchText = ref('')
const filterRole = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const formError = ref('')
const saving = ref(false)
const deleting = ref(false)
const deleteTarget = ref(null)
const editingId = ref(null)

const formData = reactive({
  username: '',
  password: '',
  role: 'volunteer'
})

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchSearch = !searchText.value || u.username.includes(searchText.value)
    const matchRole = !filterRole.value || u.role === filterRole.value
    return matchSearch && matchRole
  })
})

onMounted(fetchUsers)

async function fetchUsers() {
  try {
    const res = await getUsers()
    users.value = res.data
  } catch {
    users.value = []
  }
}

function formatDate(dt) {
  if (!dt) return '-'
  return dt.substring(0, 10)
}

function openCreate() {
  isEdit.value = false
  editingId.value = null
  formData.username = ''
  formData.password = ''
  formData.role = 'volunteer'
  formError.value = ''
  showModal.value = true
}

function openEdit(u) {
  isEdit.value = true
  editingId.value = u.id
  formData.username = u.username
  formData.password = ''
  formData.role = u.role
  formError.value = ''
  showModal.value = true
}

async function handleSave() {
  formError.value = ''
  if (!formData.username.trim()) {
    formError.value = '用户名不能为空'
    return
  }
  if (!isEdit.value && !formData.password) {
    formError.value = '请输入密码'
    return
  }
  if (formData.password && formData.password.length < 6) {
    formError.value = '密码至少6位'
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      const payload = { id: editingId.value, username: formData.username, role: formData.role }
      if (formData.password) payload.password = formData.password
      await updateUser(payload)
    } else {
      await createUser({ username: formData.username, password: formData.password, role: formData.role })
    }
    showModal.value = false
    await fetchUsers()
  } catch (e) {
    formError.value = e.message || e.msg || '操作失败'
  } finally {
    saving.value = false
  }
}

function confirmDelete(u) {
  deleteTarget.value = u
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteUser(deleteTarget.value.id)
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await fetchUsers()
  } catch (e) {
    alert(e.message || e.msg || '删除失败')
  } finally {
    deleting.value = false
  }
}
</script>
