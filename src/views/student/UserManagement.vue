<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElUpload, ElAvatar, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, User, Camera, Download } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 用户列表数据
const users = ref([
  {
    id: 1,
    username: 'student1',
    account: 'student1',
    bio: '学生账号',
    avatar: ''
  },
  {
    id: 2,
    username: 'student2',
    account: 'student2',
    bio: '学生账号',
    avatar: ''
  },
  {
    id: 3,
    username: 'student3',
    account: 'student3',
    bio: '学生账号',
    avatar: ''
  }
])

// 编辑对话框状态
const editDialogVisible = ref(false)
const currentUser = ref(null)

// 编辑表单
const editForm = ref({
  username: '',
  account: '',
  password: '',
  bio: '',
  avatar: ''
})

onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
  }
})

// 打开编辑对话框
const handleEdit = (user) => {
  currentUser.value = user
  editForm.value = {
    username: user.username,
    account: user.account,
    password: '',
    bio: user.bio,
    avatar: user.avatar
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
  const index = users.value.findIndex(u => u.id === currentUser.value.id)
  if (index !== -1) {
    users.value[index] = {
      ...users.value[index],
      username: editForm.value.username,
      account: editForm.value.account,
      bio: editForm.value.bio,
      avatar: editForm.value.avatar
    }
  }
  
  editDialogVisible.value = false
  ElMessage.success('用户信息更新成功')
}

// 删除用户
const handleDelete = (user) => {
  ElMessageBox.confirm(`确定要删除用户 ${user.username} 吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从列表中删除用户
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
    ElMessage.success('用户删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 处理头像上传
const handleAvatarUpload = (response, uploadFile) => {
  editForm.value.avatar = URL.createObjectURL(uploadFile.raw)
  ElMessage.success('头像上传成功')
}

// 下载头像
const handleDownloadAvatar = (user) => {
  if (!user.avatar) {
    ElMessage.warning('当前用户没有头像')
    return
  }
  
  const link = document.createElement('a')
  link.href = user.avatar
  link.download = `${user.username}_avatar.png`
  link.click()
  ElMessage.success('头像下载成功')
}

// 查看用户详情
const handleViewDetail = (user) => {
  router.push(`/student/user-detail/${user.id}`)
}
</script>

<template>
  <div class="user-management">
    <div class="header">
      <h2>用户管理</h2>
    </div>
    
    <el-card shadow="hover" class="user-table-card">
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="100">
          <template #default="{ row }">
            <el-avatar :size="50" :src="row.avatar">
              <User v-if="!row.avatar" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="account" label="账号" />
        <el-table-column prop="bio" label="简介" />
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button type="success" size="small" @click="handleEdit(row)">
              <Edit /> 编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <Delete /> 删除
            </el-button>
            <el-button size="small" @click="handleDownloadAvatar(row)">
              <Download /> 下载头像
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
.user-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.user-table-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
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