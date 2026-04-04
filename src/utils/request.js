import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

// 创建 axios 实例
const request = axios.create({
  //baseURL: 'http://127.0.0.1:4523/m1/7876723-7626519-default', // Mock 服务地址
  // baseURL: 'http://[fe80::dda8:f903:c567:e13%19]:8085/api', // 真实后端地址
  // baseURL: 'http://172.22.148.153:8085/api', // 真实后端地址
   baseURL: 'http://localhost:8085/api', // 真实后端地址
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case 401:
          // Token 失效，跳转到登录页面
          const userStore = useUserStore()
          userStore.clearUserInfo()
          const router = useRouter()
          router.push('/login')
          ElMessage.error('登录已过期，请重新登录')
          break
        case 403:
          ElMessage.error('没有权限访问此资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
    
    return Promise.reject(error)
  }
)

export default request
