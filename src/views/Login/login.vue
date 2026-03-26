<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { login, register } from '../../api/user'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loginForm = reactive({
  account: '',
  password: '',
  userType: ''
})
const registerForm = reactive({
  account: '',
  username: '',
  password: '',
  confirmPassword: '',
  userType: '',
  introduction: ''
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
const registerRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 6, max: 30, message: '账号长度为6-30个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能使用字母、数字、下划线', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 1, max: 30, message: '用户名长度为1-30个字符', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, message: '用户名只能使用中文、字母、数字、下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度为6-50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '密码只能使用字母、数字、下划线', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度为6-50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '密码只能使用字母、数字、下划线', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const loginLoading = ref(false)
const registerLoading = ref(false)

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loginLoading.value = true
    
    console.log('登录请求数据:', {
      account: loginForm.account,
      password: loginForm.password,
      userType: loginForm.userType
    });
    
    const response = await login({
      account: loginForm.account,
      password: loginForm.password,
      userType: loginForm.userType
    })
    
    console.log('登录响应:', response);
    console.log('登录响应数据:', response.data);
    console.log('登录响应data:', response.data.data);
    console.log('用户选择的身份类型:', loginForm.userType);
    
    if (response.data.code === 200) {
      const { token, roleType } = response.data.data
      console.log('提取的roleType:', roleType);
      // 使用用户选择的身份类型，而不是后端返回的roleType
      const userRoleType = loginForm.userType || roleType
      console.log('最终使用的roleType:', userRoleType);
      userStore.setUserInfo(token, userRoleType)
      console.log('设置后的userStore.roleType:', userStore.roleType);
      ElMessage.success('登录成功')
      // 根据角色类型跳转到相应的主页
      console.log('开始路由跳转，roleType:', userRoleType);
      if (userRoleType === 'ADMIN') {
        console.log('跳转到admin');
        router.push('/admin')
      } else if (userRoleType === 'TEACHER') {
        console.log('跳转到teacher');
        router.push('/teacher')
      } else if (userRoleType === 'STUDENT') {
        console.log('跳转到student');
        router.push('/student')
      } else {
        console.log('跳转到/');
        router.push('/')
      }
    } else {
      ElMessage.error(response.data.message || '登录失败')
    }
  } catch (error) {
    console.log('登录错误:', error);
    if (error.message && !error.response) {
      // 表单验证错误
      return
    }
    ElMessage.error(error.response?.data?.message || '登录失败，请稍后重试')
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    registerLoading.value = true
    
    console.log('注册请求数据:', {
      account: registerForm.account,
      username: registerForm.username,
      password: registerForm.password,
      userType: registerForm.userType,
      introduction: registerForm.introduction || null
    });
    
    const response = await register({
      account: registerForm.account,
      username: registerForm.username,
      password: registerForm.password,
      userType: registerForm.userType,
      introduction: registerForm.introduction || null
    })
    
    console.log('注册响应:', response);
    
    if (response.data.code === 200) {
      ElMessage.success('注册成功，请登录')
      // 重置注册表单
      registerForm.account = ''
      registerForm.username = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.userType = ''
      registerForm.introduction = ''
      // 切换到登录标签页
      activeTab.value = 'login'
    } else {
      ElMessage.error(response.data.message || '注册失败')
    }
  } catch (error) {
    console.log('注册错误:', error);
    if (error.message && !error.response) {
      // 表单验证错误
      return
    }
    ElMessage.error(error.response?.data?.message || '注册失败，请稍后重试')
  } finally {
    registerLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <img src="../../assets/logo.png" alt="理程学院" />
        <h1>理程学院</h1>
      </div>
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="登录" name="login">
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
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="login-form" label-position="top">
            <el-form-item label="账号" prop="account">
              <el-input v-model="registerForm.account" placeholder="请输入账号"></el-input>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" show-password placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" show-password placeholder="请确认密码"></el-input>
            </el-form-item>
            <el-form-item label="用户类型" prop="userType">
              <el-select v-model="registerForm.userType" placeholder="请选择用户类型">
                <el-option label="管理员" value="ADMIN"></el-option>
                <el-option label="教师" value="TEACHER"></el-option>
                <el-option label="学生" value="STUDENT"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="简介">
              <el-input v-model="registerForm.introduction" type="textarea" placeholder="请输入简介"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="registerLoading" @click="handleRegister" class="login-button">注册</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo img {
  max-width: 240px;
  max-height: 240px;
  width: auto;
  height: auto;
  margin-bottom: 10px;
}

.logo h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.login-tabs {
  width: 100%;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}
</style>