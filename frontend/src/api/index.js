import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => {
    if (res.data.code !== 0) return Promise.reject(res.data)
    return res.data
  },
  err => {
    // 登录/注册接口的 401 不要跳转，让页面自己处理
    const isAuthApi = err.config?.url?.includes('auth.php')
    if (err.response?.status === 401 && !isAuthApi) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    const data = err.response?.data
    if (data && typeof data === 'object' && data.message) {
      return Promise.reject(data)
    }
    return Promise.reject({ message: err.message || '网络请求失败，请检查后端服务是否正常' })
  }
)

export default api
