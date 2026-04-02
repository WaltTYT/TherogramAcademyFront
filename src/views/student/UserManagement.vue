<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElUpload, ElAvatar, ElMessageBox, ElCard, ElTag, ElDescriptions, ElDescriptionsItem, ElTable, ElTableColumn, ElPagination, ElRadioGroup, ElRadioButton } from 'element-plus'
import { Edit, Delete, User, Camera, Download, Search, Refresh } from '@element-plus/icons-vue'
import { getUserDetail, updateUser, deleteUser, uploadUserAvatar, downloadUserAvatar, getUserPage, searchUserPage } from '../../api/user'

const router = useRouter()
const userStore = useUserStore()

// 当前用户信息
const currentUser = ref(null)
const loading = ref(false)

// 搜索相关
const searchMode = ref('personal') // 'personal' 或 'search'
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const searchForm = ref({
  account: '',
  username: '',
  sortType: 0,
  isAsc: true
})

// 编辑对话框状态
const editDialogVisible = ref(false)
const editForm = ref({
  username: '',
  account: '',
  password: '',
  bio: '',
  avatar: ''
})

// 用户详情对话框
const detailDialogVisible = ref(false)
const selectedUser = ref(null)

// 选中的用户信息展示（用于搜索模式顶部显示）
const displayedUser = ref(null)

// 当前登录用户角色
const currentUserRole = ref('')

onMounted(() => {
  if (!userStore.token) {
    router.push('/login')
    return
  }
  loadCurrentUser()
})

// 加载当前用户信息
const loadCurrentUser = async () => {
  loading.value = true
  try {
    const res = await getUserDetail()
    if (res.data.code === 200) {
      currentUser.value = res.data.data
      currentUserRole.value = res.data.data.roleType
      displayedUser.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '获取用户信息失败')
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 搜索用户
const handleSearch = async () => {
  loading.value = true
  try {
    const params = {
      account: searchForm.value.account || null,
      username: searchForm.value.username || null,
      sortType: searchForm.value.sortType,
      isAsc: searchForm.value.isAsc,
      page: currentPage.value,
      size: pageSize.value
    }
    const res = await searchUserPage(params)
    if (res.data.code === 200) {
      // 过滤掉管理员用户
      users.value = (res.data.data.records || []).filter(user => user.roleType !== 'ADMIN')
      total.value = users.value.length
    } else {
      ElMessage.error(res.data.message || '搜索用户失败')
      users.value = []
      total.value = 0
    }
  } catch (error) {
    ElMessage.error('搜索用户失败')
    users.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    account: '',
    username: '',
    sortType: 0,
    isAsc: true
  }
  currentPage.value = 1
  handleSearch()
}

// 页码改变
const handlePageChange = (page) => {
  currentPage.value = page
  handleSearch()
}

// 页面大小改变
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  handleSearch()
}

// 查看用户详情
const handleViewDetail = (user) => {
  selectedUser.value = user
  detailDialogVisible.value = true
}

// 选择用户进行展示
const handleSelectUser = (user) => {
  displayedUser.value = user
}

// 打开编辑对话框（用于搜索模式中的编辑）
const handleEditDisplayedUser = () => {
  if (!displayedUser.value) return
  editForm.value = {
    username: displayedUser.value.username,
    account: displayedUser.value.account,
    password: '',
    bio: displayedUser.value.bio,
    avatar: displayedUser.value.avatar
  }
  editDialogVisible.value = true
}

// 保存用户信息（用于搜索模式中的编辑）
const handleSaveDisplayedUser = async () => {
  if (!editForm.value.username || !editForm.value.account) {
    ElMessage.error('用户名和账号不能为空')
    return
  }

  loading.value = true
  try {
    const res = await updateUser({
      ...editForm.value,
      id: displayedUser.value.id
    })

    if (res.data.code === 200) {
      // 更新展示的用户信息
      displayedUser.value = {
        ...displayedUser.value,
        username: editForm.value.username,
        account: editForm.value.account,
        bio: editForm.value.bio,
        avatar: editForm.value.avatar
      }
      // 如果编辑的是当前用户，也更新当前用户信息
      if (displayedUser.value.id === currentUser.value.id) {
        currentUser.value = { ...displayedUser.value }
      }
      // 更新列表中的用户信息
      const index = users.value.findIndex(u => u.id === displayedUser.value.id)
      if (index !== -1) {
        users.value[index] = { ...displayedUser.value }
      }
      editDialogVisible.value = false
      ElMessage.success('用户信息更新成功')
    } else {
      ElMessage.error(res.data.message || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新用户信息失败')
  } finally {
    loading.value = false
  }
}

// 打开编辑对话框
const handleEdit = () => {
  if (!currentUser.value) return
  editForm.value = {
    username: currentUser.value.username,
    account: currentUser.value.account,
    password: '',
    bio: currentUser.value.bio,
    avatar: currentUser.value.avatar
  }
  editDialogVisible.value = true
}

// 保存用户信息
const handleSave = async () => {
  if (!editForm.value.username || !editForm.value.account) {
    ElMessage.error('用户名和账号不能为空')
    return
  }

  loading.value = true
  try {
    const res = await updateUser({
      ...editForm.value,
      id: currentUser.value.id
    })

    if (res.data.code === 200) {
      currentUser.value = {
        ...currentUser.value,
        username: editForm.value.username,
        account: editForm.value.account,
        bio: editForm.value.bio,
        avatar: editForm.value.avatar
      }
      editDialogVisible.value = false
      ElMessage.success('用户信息更新成功')
    } else {
      ElMessage.error(res.data.message || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新用户信息失败')
  } finally {
    loading.value = false
  }
}

// 删除用户（注销）
const handleDelete = () => {
  if (!currentUser.value) return

  ElMessageBox.confirm(`确定要注销您的账号吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      const res = await deleteUser()
      if (res.data.code === 200) {
        ElMessage.success('账号注销成功')
        userStore.clearUserInfo()
        router.push('/login')
      } else {
        ElMessage.error(res.data.message || '注销失败')
      }
    } catch (error) {
      ElMessage.error('注销失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

// 处理头像上传
const handleAvatarUpload = async (uploadFile) => {
  if (!currentUser.value) return

  try {
    const res = await uploadUserAvatar(currentUser.value.id, uploadFile.raw)
    if (res.data.code === 200) {
      editForm.value.avatar = URL.createObjectURL(uploadFile.raw)
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.data.message || '头像上传失败')
    }
  } catch (error) {
    ElMessage.error('头像上传失败')
  }
}

// 下载头像
const handleDownloadAvatar = async (user) => {
  const targetUser = user || currentUser.value
  if (!targetUser || !targetUser.avatar) {
    ElMessage.warning('当前没有头像')
    return
  }

  try {
    const res = await downloadUserAvatar(targetUser.avatar)
    const blob = new Blob([res.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${targetUser.username}_avatar.png`
    link.click()
    ElMessage.success('头像下载成功')
  } catch (error) {
    ElMessage.error('头像下载失败')
  }
}

// 获取用户类型标签
const getRoleTypeLabel = (roleType) => {
  const roleMap = {
    'ADMIN': '管理员',
    'TEACHER': '教师',
    'STUDENT': '学生'
  }
  return roleMap[roleType] || roleType
}

const getRoleTypeTagType = (roleType) => {
  const typeMap = {
    'ADMIN': 'danger',
    'TEACHER': 'warning',
    'STUDENT': 'success'
  }
  return typeMap[roleType] || 'info'
}

// 模拟数据
const getMockCurrentUser = () => ({
  id: 3,
  username: 'student1',
  account: 'student1',
  bio: '大一学生',
  avatar: '',
  roleType: 'STUDENT',
  createTime: '2024-01-03T10:00:00',
  deleted: false
})

const getMockUsers = () => [
  { id: 2, username: 'teacher1', account: 'teacher1', bio: '数学教师', avatar: '', roleType: 'TEACHER', createTime: '2024-01-02T10:00:00', deleted: false },
  { id: 3, username: 'student1', account: 'student1', bio: '大一学生', avatar: '', roleType: 'STUDENT', createTime: '2024-01-03T10:00:00', deleted: false },
  { id: 4, username: 'student2', account: 'student2', bio: '大二学生', avatar: '', roleType: 'STUDENT', createTime: '2024-01-04T10:00:00', deleted: false },
  { id: 5, username: 'teacher2', account: 'teacher2', bio: '英语教师', avatar: '', roleType: 'TEACHER', createTime: '2024-01-05T10:00:00', deleted: false }
]
</script>

<template>
  <div class="user-management">
    <div class="header">
      <h2>用户管理</h2>
    </div>

    <!-- 模式切换 -->
    <el-card class="mode-card" shadow="never">
      <el-radio-group v-model="searchMode">
        <el-radio-button label="personal">个人信息</el-radio-button>
        <el-radio-button label="search">用户搜索</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 个人信息模式 -->
    <template v-if="searchMode === 'personal'">
      <el-card v-if="currentUser" shadow="hover" class="user-info-card">
        <div class="user-info-header">
          <el-avatar :size="80" :src="currentUser.avatar">
            <User v-if="!currentUser.avatar" />
          </el-avatar>
          <div class="user-info-basic">
            <h3>{{ currentUser.username }}</h3>
            <el-tag :type="getRoleTypeTagType(currentUser.roleType)">
              {{ getRoleTypeLabel(currentUser.roleType) }}
            </el-tag>
          </div>
        </div>

        <el-descriptions :column="2" border class="user-info-detail">
          <el-descriptions-item label="账号">{{ currentUser.account }}</el-descriptions-item>
          <el-descriptions-item label="用户类型">
            <el-tag :type="getRoleTypeTagType(currentUser.roleType)">
              {{ getRoleTypeLabel(currentUser.roleType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">{{ currentUser.bio || '暂无简介' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentUser.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.deleted ? 'danger' : 'success'">
              {{ currentUser.deleted ? '已注销' : '正常' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="user-info-actions">
          <el-button type="primary" @click="handleEdit">
            <Edit /> 修改信息
          </el-button>
          <el-button type="danger" @click="handleDelete">
            <Delete /> 注销账号
          </el-button>
          <el-button @click="handleDownloadAvatar()" :disabled="!currentUser.avatar">
            <Download /> 下载头像
          </el-button>
        </div>
      </el-card>
    </template>

    <!-- 搜索模式 -->
    <template v-else>
      <!-- 用户信息展示区域 -->
      <el-card v-if="displayedUser" shadow="hover" class="user-display-card">
        <div class="user-display-header">
          <el-avatar :size="100" :src="displayedUser.avatar" class="user-display-avatar">
            <User v-if="!displayedUser.avatar" />
          </el-avatar>
          <div class="user-display-info">
            <div class="user-display-name">
              <h3>{{ displayedUser.username }}</h3>
              <el-tag :type="getRoleTypeTagType(displayedUser.roleType)" size="large">
                {{ getRoleTypeLabel(displayedUser.roleType) }}
              </el-tag>
            </div>
            <div class="user-display-account">
              <span class="label">账号：</span>
              <span class="value">{{ displayedUser.account }}</span>
            </div>
            <div class="user-display-bio">
              <span class="label">简介：</span>
              <span class="value">{{ displayedUser.bio || '暂无简介' }}</span>
            </div>
          </div>
        </div>
        <!-- 编辑按钮 - 仅管理员可见 -->
        <div v-if="currentUserRole === 'ADMIN'" class="user-display-actions">
          <el-button type="primary" size="large" @click="handleEditDisplayedUser">
            <Edit /> 编辑用户
          </el-button>
        </div>
      </el-card>

      <!-- 搜索区域 -->
      <el-card class="search-card" shadow="never">
        <el-form :model="searchForm" label-width="100px" class="search-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="账号">
                <el-input v-model="searchForm.account" placeholder="请输入账号" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="用户名">
                <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="排序方向">
                <el-radio-group v-model="searchForm.isAsc">
                  <el-radio-button :label="true">升序</el-radio-button>
                  <el-radio-button :label="false">降序</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24" style="text-align: center;">
              <el-button type="primary" @click="handleSearch">
                <Search /> 搜索
              </el-button>
              <el-button @click="handleReset">
                <Refresh /> 重置
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 用户列表 -->
      <el-card shadow="hover" class="user-table-card">
        <el-table :data="users" style="width: 100%" v-loading="loading">
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
          <el-table-column prop="roleType" label="用户类型">
            <template #default="{ row }">
              <el-tag :type="getRoleTypeTagType(row.roleType)">
                {{ getRoleTypeLabel(row.roleType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="bio" label="简介" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleViewDetail(row)">
                查看详情
              </el-button>
              <el-button type="success" size="small" @click="handleSelectUser(row)">
                选择展示
              </el-button>
              <el-button size="small" @click="handleDownloadAvatar(row)" :disabled="!row.avatar">
                <Download /> 下载头像
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </template>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改个人信息" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :http-request="handleAvatarUpload"
            :before-upload="(file) => {
              const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isJPG) ElMessage.error('只能上传 JPG/PNG 图片');
              if (!isLt2M) ElMessage.error('图片大小不能超过 2MB');
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
          <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="600px">
      <el-descriptions :column="2" border v-if="selectedUser">
        <el-descriptions-item label="ID" :span="1">{{ selectedUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户类型" :span="1">
          <el-tag :type="getRoleTypeTagType(selectedUser.roleType)">
            {{ getRoleTypeLabel(selectedUser.roleType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="头像" :span="2">
          <el-avatar :size="80" :src="selectedUser.avatar">
            <User v-if="!selectedUser.avatar" />
          </el-avatar>
        </el-descriptions-item>
        <el-descriptions-item label="用户名" :span="1">{{ selectedUser.username }}</el-descriptions-item>
        <el-descriptions-item label="账号" :span="1">{{ selectedUser.account }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ selectedUser.bio || '暂无简介' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="1">{{ selectedUser.createTime }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="selectedUser.deleted ? 'danger' : 'success'">
            {{ selectedUser.deleted ? '已注销' : '正常' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
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

.mode-card {
  margin-bottom: 15px;
  background: white;
  border-radius: 8px;
}

.user-info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.user-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.user-info-basic {
  margin-left: 20px;
}

.user-info-basic h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #333;
}

.user-info-detail {
  margin-bottom: 20px;
}

.user-info-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.search-card {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
}

.user-display-card {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.user-display-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.user-display-avatar {
  flex-shrink: 0;
  border: 3px solid #ebeef5;
}

.user-display-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-display-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-display-name h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.user-display-account,
.user-display-bio {
  font-size: 14px;
  color: #606266;
}

.user-display-account .label,
.user-display-bio .label {
  color: #909399;
  margin-right: 8px;
}

.user-display-account .value {
  font-weight: 500;
  color: #303133;
}

.user-display-bio .value {
  line-height: 1.6;
}

.user-display-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
}

.search-form {
  padding: 10px;
}

.user-table-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
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
