<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { login } from '../../api/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = reactive({
  account: '',
  password: '',
  userType: ''
})

const loginRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 6, max: 30, message: '账号长度为6-30个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能使用字母、数字、下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度为6-50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '密码只能使用字母、数字、下划线', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择身份', trigger: 'change' }
  ]
}

const loginFormRef = ref(null)
const loginLoading = ref(false)

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loginLoading.value = true
    
    console.log('登录请求数据:', {
      account: loginForm.account,
      password: loginForm.password,
      userType: loginForm.userType
    })
    
    const response = await login({
      account: loginForm.account,
      password: loginForm.password,
      userType: loginForm.userType
    })
    
    console.log('登录响应:', response)
    console.log('登录响应数据:', response.data)
    console.log('登录响应data:', response.data.data)
    console.log('用户选择的身份类型:', loginForm.userType)
    
    if (response.data.code === 200) {
      const { token, roleType } = response.data.data
      console.log('提取的roleType:', roleType)
      const userRoleType = loginForm.userType || roleType
      console.log('最终使用的roleType:', userRoleType)
      userStore.setUserInfo(token, userRoleType)
      console.log('设置后的userStore.roleType:', userStore.roleType)
      ElMessage.success('登录成功')
      console.log('开始路由跳转，roleType:', userRoleType)
      if (userRoleType === 'ADMIN') {
        console.log('跳转到admin')
        router.push('/admin')
      } else if (userRoleType === 'TEACHER') {
        console.log('跳转到teacher')
        router.push('/teacher')
      } else if (userRoleType === 'STUDENT') {
        console.log('跳转到student')
        router.push('/student')
      } else {
        console.log('跳转到/')
        router.push('/')
      }
    } else {
      ElMessage.error(response.data.message || '登录失败')
    }
  } catch (error) {
    console.log('登录错误:', error)
    if (error.message && !error.response) {
      return
    }
    ElMessage.error(error.response?.data?.message || '登录失败，请稍后重试')
  } finally {
    loginLoading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <img src="../../assets/logo.png" alt="理程学院" />
      </div>
      <div class="login-title">登录</div>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" label-position="top">
        <el-form-item label="账号" prop="account">
          <el-input v-model="loginForm.account" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" show-password placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="身份" prop="userType">
          <el-select v-model="loginForm.userType" placeholder="请选择身份">
            <el-option label="管理员" value="ADMIN"></el-option>
            <el-option label="教师" value="TEACHER"></el-option>
            <el-option label="学生" value="STUDENT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loginLoading" @click="handleLogin" class="login-button">登录</el-button>
        </el-form-item>
        <el-form-item>
          <div class="register-link">
            还没有账号？<span class="link" @click="goToRegister">立即注册</span>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('../../assets/LoginBackground.png') no-repeat center center fixed;
  background-size: cover;
}

.login-box {
  width: 700px;
  padding: 40px 100px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);

  max-height: 90vh;
  overflow-y: auto;
}

.logo {
  display: flex;
  justify-content: center;  /* 水平居中 */
  align-items: center;      /* 垂直居中 */
  margin-bottom: 10px;
}

.logo img {
  max-width: 600px;
  max-height: 600px;
  width: auto;
  height: auto;
  margin-bottom: 10px;
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-link .link {
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
}


.register-link .link:hover {
  color: #764ba2;
}
</style>
