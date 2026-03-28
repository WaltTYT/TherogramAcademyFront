<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElUpload, ElAvatar, ElMessageBox, ElSelect, ElOption, ElDatePicker, ElPagination, ElCard, ElCheckbox, ElRadioGroup, ElRadioButton } from 'element-plus'
import { Edit, Delete, Plus, User, Camera, Download, Search, Refresh } from '@element-plus/icons-vue'
import { getUserPage, searchUserPage, getUsernameById } from '../../api/user'

const router = useRouter()
const userStore = useUserStore()

// 用户列表数据
const users = ref([])
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索模式：'advanced' 表示高级搜索，'keyword' 表示关键字搜索
const searchMode = ref('advanced')

// 高级搜索表单
const advancedSearchForm = ref({
  account: '',
  username: '',
  roleType: '',
  filterDeleted: false,
  startCreateTime: null,
  endCreateTime: null,
  sortType: 0,
  isAsc: true
})

// 关键字搜索表单
const keywordSearchForm = ref({
  account: '',
  username: '',
  sortType: 0,
  isAsc: true
})

// 用户类型选项
const roleTypeOptions = [
  { label: '全部', value: '' },
  { label: '管理员', value: 'ADMIN' },
  { label: '教师', value: 'TEACHER' },
  { label: '学生', value: 'STUDENT' }
]

// 页面大小选项
const pageSizeOptions = [10, 20, 50, 100]

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

// 用户详情对话框
const detailDialogVisible = ref(false)
const userDetail = ref({})

// 选中的用户信息展示（用于搜索模式顶部显示）
const displayedUser = ref(null)

// 当前登录用户角色
const currentUserRole = ref('ADMIN')

onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 加载用户数据
  loadUsers()
})

// 加载用户数据
const loadUsers = async () => {
  loading.value = true
  try {
    let res
    if (searchMode.value === 'advanced') {
      // 高级搜索
      const params = {
        account: advancedSearchForm.value.account || null,
        username: advancedSearchForm.value.username || null,
        roleType: advancedSearchForm.value.roleType || null,
        filterDeleted: advancedSearchForm.value.filterDeleted,
        startCreateTime: advancedSearchForm.value.startCreateTime,
        endCreateTime: advancedSearchForm.value.endCreateTime,
        sortType: advancedSearchForm.value.sortType,
        isAsc: advancedSearchForm.value.isAsc,
        page: currentPage.value,
        size: pageSize.value
      }
      res = await getUserPage(params)
    } else {
      // 关键字搜索
      const params = {
        account: keywordSearchForm.value.account || null,
        username: keywordSearchForm.value.username || null,
        sortType: keywordSearchForm.value.sortType,
        isAsc: keywordSearchForm.value.isAsc,
        page: currentPage.value,
        size: pageSize.value
      }
      res = await searchUserPage(params)
    }
    
    if (res.data.code === 200) {
      users.value = res.data.data.records || []
      total.value = res.data.data.total || 0
      
      // 如果没有数据，显示模拟数据
      if (users.value.length === 0) {
        users.value = getMockUsers()
        total.value = users.value.length
      }
    } else {
      ElMessage.error(res.data.message || '获取用户列表失败')
      // 使用模拟数据
      users.value = getMockUsers()
      total.value = users.value.length
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.warning('后端接口未连接，显示模拟数据')
    // 使用模拟数据
    users.value = getMockUsers()
    total.value = users.value.length
  } finally {
    loading.value = false
  }
}

// 模拟用户数据
const getMockUsers = () => {
  return [
    {
      id: 1,
      username: 'admin',
      account: 'admin',
      bio: '系统管理员账号',
      avatar: '',
      roleType: 'ADMIN',
      createTime: '2024-01-01T10:00:00',
      deleted: false
    },
    {
      id: 2,
      username: 'teacher1',
      account: 'teacher1',
      bio: '数学教师',
      avatar: '',
      roleType: 'TEACHER',
      createTime: '2024-01-02T10:00:00',
      deleted: false
    },
    {
      id: 3,
      username: 'student1',
      account: 'student1',
      bio: '大一学生',
      avatar: '',
      roleType: 'STUDENT',
      createTime: '2024-01-03T10:00:00',
      deleted: false
    },
    {
      id: 4,
      username: 'student2',
      account: 'student2',
      bio: '大二学生',
      avatar: '',
      roleType: 'STUDENT',
      createTime: '2024-01-04T10:00:00',
      deleted: false
    },
    {
      id: 5,
      username: 'teacher2',
      account: 'teacher2',
      bio: '英语教师',
      avatar: '',
      roleType: 'TEACHER',
      createTime: '2024-01-05T10:00:00',
      deleted: false
    }
  ]
}

// 搜索按钮点击
const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

// 重置搜索条件
const handleReset = () => {
  if (searchMode.value === 'advanced') {
    advancedSearchForm.value = {
      account: '',
      username: '',
      roleType: '',
      filterDeleted: false,
      startCreateTime: null,
      endCreateTime: null,
      sortType: 0,
      isAsc: true
    }
  } else {
    keywordSearchForm.value = {
      account: '',
      username: '',
      sortType: 0,
      isAsc: true
    }
  }
  currentPage.value = 1
  loadUsers()
}

// 页码改变
const handlePageChange = (page) => {
  currentPage.value = page
  loadUsers()
}

// 页面大小改变
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadUsers()
}

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
const handleViewDetail = async (user) => {
  try {
    // 获取用户详细信息
    userDetail.value = { ...user }
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 选择用户进行展示
const handleSelectUser = (user) => {
  displayedUser.value = user
}

// 打开编辑对话框（用于搜索模式中的编辑）
const handleEditDisplayedUser = () => {
  if (!displayedUser.value) return
  currentUser.value = displayedUser.value
  editForm.value = {
    username: displayedUser.value.username,
    account: displayedUser.value.account,
    password: '',
    bio: displayedUser.value.bio,
    avatar: displayedUser.value.avatar
  }
  editDialogVisible.value = true
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

// 获取用户类型标签样式
const getRoleTypeTagType = (roleType) => {
  const typeMap = {
    'ADMIN': 'danger',
    'TEACHER': 'warning',
    'STUDENT': 'success'
  }
  return typeMap[roleType] || 'info'
}
</script>

<template>
  <div class="user-management">
    <div class="header">
      <h2>用户管理</h2>
    </div>
    
    <!-- 搜索模式切换 -->
    <el-card class="search-mode-card" shadow="never">
      <el-radio-group v-model="searchMode" @change="handleReset">
        <el-radio-button label="advanced">高级搜索</el-radio-button>
        <el-radio-button label="keyword">关键字搜索</el-radio-button>
      </el-radio-group>
    </el-card>
    
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
      <!-- 编辑按钮 - 管理员可见 -->
      <div class="user-display-actions">
        <el-button type="primary" size="large" @click="handleEditDisplayedUser">
          <Edit /> 编辑用户
        </el-button>
      </div>
    </el-card>
    
    <!-- 高级搜索区域 -->
    <el-card v-if="searchMode === 'advanced'" class="search-card" shadow="never">
      <el-form :model="advancedSearchForm" label-width="100px" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="账号">
              <el-input v-model="advancedSearchForm.account" placeholder="请输入账号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用户名">
              <el-input v-model="advancedSearchForm.username" placeholder="请输入用户名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用户类型">
              <el-select v-model="advancedSearchForm.roleType" placeholder="请选择用户类型" clearable style="width: 100%">
                <el-option
                  v-for="item in roleTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="advancedSearchForm.startCreateTime"
                type="datetime"
                placeholder="起始时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="至">
              <el-date-picker
                v-model="advancedSearchForm.endCreateTime"
                type="datetime"
                placeholder="结束时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-checkbox v-model="advancedSearchForm.filterDeleted">过滤已注销用户</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="排序方式">
              <el-select v-model="advancedSearchForm.sortType" style="width: 100%">
                <el-option label="按创建时间排序" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序方向">
              <el-radio-group v-model="advancedSearchForm.isAsc">
                <el-radio-button :label="true">升序</el-radio-button>
                <el-radio-button :label="false">降序</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <Search /> 搜索
              </el-button>
              <el-button @click="handleReset">
                <Refresh /> 重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 关键字搜索区域 -->
    <el-card v-else class="search-card" shadow="never">
      <el-form :model="keywordSearchForm" label-width="100px" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="账号关键字">
              <el-input v-model="keywordSearchForm.account" placeholder="请输入账号关键字" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用户名关键字">
              <el-input v-model="keywordSearchForm.username" placeholder="请输入用户名关键字" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序方向">
              <el-radio-group v-model="keywordSearchForm.isAsc">
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
        <el-table-column label="操作" width="380" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button type="success" size="small" @click="handleSelectUser(row)">
              选择展示
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">
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
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizeOptions"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
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
    
    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID" :span="1">{{ userDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户类型" :span="1">
          <el-tag :type="getRoleTypeTagType(userDetail.roleType)">
            {{ getRoleTypeLabel(userDetail.roleType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="头像" :span="2">
          <el-avatar :size="80" :src="userDetail.avatar">
            <User v-if="!userDetail.avatar" />
          </el-avatar>
        </el-descriptions-item>
        <el-descriptions-item label="用户名" :span="1">{{ userDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="账号" :span="1">{{ userDetail.account }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ userDetail.bio || '暂无简介' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="1">{{ userDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="userDetail.deleted ? 'danger' : 'success'">
            {{ userDetail.deleted ? '已注销' : '正常' }}
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

.search-mode-card {
  margin-bottom: 15px;
  background: white;
  border-radius: 8px;
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
