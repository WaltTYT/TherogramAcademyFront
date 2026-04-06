<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { register } from '../../api/user'

const router = useRouter()

const registerForm = reactive({
  account: '',
  username: '',
  password: '',
  confirmPassword: '',
  userType: '',
  introduction: ''
})

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

const registerFormRef = ref(null)
const registerLoading = ref(false)

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
    })
    
    const response = await register({
      account: registerForm.account,
      username: registerForm.username,
      password: registerForm.password,
      userType: registerForm.userType,
      introduction: registerForm.introduction || null
    })
    
    console.log('注册响应:', response)
    
    if (response.data.code === 200) {
      ElMessage.success('注册成功，请登录')
      ElMessageBox.confirm('注册成功！是否前往登录页面？', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '继续注册',
        type: 'success'
      }).then(() => {
        router.push('/login')
      }).catch(() => {
        resetForm()
      })
    } else {
      ElMessage.error(response.data.message || '注册失败')
    }
  } catch (error) {
    console.log('注册错误:', error)
    if (error.message && !error.response) {
      return
    }
    ElMessage.error(error.response?.data?.message || '注册失败，请稍后重试')
  } finally {
    registerLoading.value = false
  }
}

const resetForm = () => {
  registerForm.account = ''
  registerForm.username = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.userType = ''
  registerForm.introduction = ''
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <div class="logo">
        <img src="../../assets/logo.png" alt="理程学院" />
      </div>
      <div class="register-title">注册</div>
      <div class="form-scroll-container">
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form" label-position="top">
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
              <el-option label="教师" value="TEACHER"></el-option>
              <el-option label="学生" value="STUDENT"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="简介">
            <el-input v-model="registerForm.introduction" type="textarea" placeholder="请输入简介"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <el-form ref="registerFormRef" :model="registerForm" class="register-form-bottom" label-position="top">
        <el-form-item>
          <el-button type="primary" :loading="registerLoading" @click="handleRegister" class="register-button">注册</el-button>
        </el-form-item>
        <el-form-item>
          <div class="login-link">
            已有账号？<span class="link" @click="goToLogin">立即登录</span>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('../../assets/LoginBackground.png') no-repeat center center fixed;
  background-size: cover;
}

.register-box {
  width: 700px;
  height: 850px;
  padding: 40px 100px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
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

.register-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.form-scroll-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 20px;
}

.form-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.form-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.form-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.form-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.register-form {
  margin-top: 20px;
}

.register-form-bottom {
  margin-top: 0;
}

.register-button {
  width: 100%;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link .link {
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
}

.login-link .link:hover {
  color: #764ba2;
}
</style>
