<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElCard, ElButton, ElAvatar, ElDescriptions, ElDescriptionsItem, ElDialog, ElForm, ElFormItem, ElInput, ElUpload } from 'element-plus'
import { Edit, Back, Camera, Download, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 用户信息
const userInfo = ref({
  id: 1,
  username: 'admin',
  account: 'admin',
  bio: '管理员账号',
  avatar: ''
})

// 编辑对话框状态
const editDialogVisible = ref(false)

// 编辑表单
const editForm = ref({
  username: '',
  account: '',
  password: '',
  bio: '',
  avatar: ''
})

// 模拟用户数据
const userData = [
  {
    id: 1,
    username: 'admin',
    account: 'admin',
    bio: '管理员账号',
    avatar: ''
  },
  {
    id: 2,
    username: 'teacher1',
    account: 'teacher1',
    bio: '教师账号',
    avatar: ''
  },
  {
    id: 3,
    username: 'student1',
    account: 'student1',
    bio: '学生账号',
    avatar: ''
  }
]

onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
  }
  
  // 获取用户ID
  const userId = parseInt(route.params.id)
  // 查找用户信息
  const user = userData.find(u => u.id === userId)
  if (user) {
    userInfo.value = user
  } else {
    ElMessage.error('用户不存在')
    router.push('/user-management')
  }
})

// 打开编辑对话框
const handleEdit = () => {
  editForm.value = {
    username: userInfo.value.username,
    account: userInfo.value.account,
    password: '',
    bio: userInfo.value.bio,
    avatar: userInfo.value.avatar
  }
  editDialogVisible.value = true
}

// 保存用户信息
const handleSave = () => {
  if (!editForm.value.username || !editForm.value.account) {
    ElMessage.error('用户名和账号不能为空')
    return
  }
  
  // 更新用户信息
  userInfo.value = {
    ...userInfo.value,
    username: editForm.value.username,
    account: editForm.value.account,
    bio: editForm.value.bio,
    avatar: editForm.value.avatar
  }
  
  editDialogVisible.value = false
  ElMessage.success('用户信息更新成功')
}

// 处理头像上传
const handleAvatarUpload = (response, uploadFile) => {
  editForm.value.avatar = URL.createObjectURL(uploadFile.raw)
  ElMessage.success('头像上传成功')
}

// 下载头像
const handleDownloadAvatar = () => {
  if (!userInfo.value.avatar) {
    ElMessage.warning('当前用户没有头像')
    return
  }
  
  const link = document.createElement('a')
  link.href = userInfo.value.avatar
  link.download = `${userInfo.value.username}_avatar.png`
  link.click()
  ElMessage.success('头像下载成功')
}

// 返回用户管理页面
const handleBack = () => {
  router.push('/user-management')
}
</script>

<template>
  <div class="user-detail">
    <div class="header">
      <h2>用户详情</h2>
      <el-button type="primary" @click="handleBack">
        <Back /> 返回
      </el-button>
    </div>
    
    <el-card shadow="hover" class="user-detail-card">
      <div class="user-avatar-section">
        <el-avatar :size="120" :src="userInfo.avatar" class="user-avatar">
          <User v-if="!userInfo.avatar" />
        </el-avatar>
        <div class="avatar-actions">
          <el-button type="primary" size="small" @click="handleDownloadAvatar">
            <Download /> 下载头像
          </el-button>
        </div>
      </div>
      
      <el-descriptions title="用户信息" border column="1" class="user-descriptions">
        <el-descriptions-item label="ID">{{ userInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ userInfo.account }}</el-descriptions-item>
        <el-descriptions-item label="简介">{{ userInfo.bio }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="action-buttons">
        <el-button type="primary" @click="handleEdit">
          <Edit /> 编辑用户信息
        </el-button>
      </div>
    </el-card>
    
    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户信息"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :on-success="handleAvatarUpload"
            :before-upload="(file) => {
              const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isJPG) {
                ElMessage.error('只能上传 JPG/PNG 图片');
              }
              if (!isLt2M) {
                ElMessage.error('图片大小不能超过 2MB');
              }
              return isJPG && isLt2M;
            }"
          >
            <el-avatar :size="100" :src="editForm.avatar" class="edit-avatar">
              <Camera v-if="!editForm.avatar" />
            </el-avatar>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="editForm.account" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="editForm.password" type="password" placeholder="请输入密码（留空表示不修改）" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="editForm.bio" type="textarea" placeholder="请输入简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-detail {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.user-detail-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.user-avatar {
  margin-bottom: 20px;
  border: 3px solid #667eea;
}

.avatar-actions {
  display: flex;
  gap: 10px;
}

.user-descriptions {
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.edit-avatar {
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>