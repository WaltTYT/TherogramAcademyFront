<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElUpload, ElAvatar, ElMessageBox, ElSelect, ElOption, ElDatePicker, ElPagination, ElCard, ElCheckbox, ElRadioGroup, ElRadioButton } from 'element-plus'
import { Edit, Delete, Plus, User, Camera, Download, Search, Refresh } from '@element-plus/icons-vue'
import { getUserPage, searchUserPage, getUsernameById, getUserDetail, updateUser, deleteUser, uploadUserAvatar, downloadUserAvatar } from '../../api/user'

const router = useRouter()
const userStore = useUserStore()

// 用户列表数据
const users = ref([])
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 主模式：'personal' 表示个人信息，'search' 表示用户搜索
const mainMode = ref('personal')

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

// 个人信息表单
const personalForm = ref({
  username: '',
  account: '',
  password: '',
  bio: '',
  portrait: ''
})

// 个人信息表单的本地预览图片
const personalFormLocalAvatar = ref('')
const personalFormAvatarFile = ref(null)

// 个人信息详情
const personalInfo = ref(null)

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
  portrait: ''
})

// 编辑表单的本地预览图片
const editFormLocalAvatar = ref('')
const editFormAvatarFile = ref(null)

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
  // 加载个人信息
  loadPersonalInfo()
  // 加载用户数据
  loadUsers()
})

// 加载个人信息
const loadPersonalInfo = async () => {
  loading.value = true
  try {
    const res = await getUserDetail()
    if (res.data.code === 200) {
      personalInfo.value = res.data.data
      currentUserRole.value = res.data.data.roleType
      personalForm.value = {
        username: res.data.data.username,
        account: res.data.data.account,
        password: '',
        bio: res.data.data.bio,
        avatar: res.data.data.avatar
      }
    } else {
      ElMessage.error(res.data.message || '获取个人信息失败')
      // 使用模拟数据
      personalInfo.value = getMockAdminInfo()
      currentUserRole.value = 'ADMIN'
      personalForm.value = {
        username: 'admin',
        account: 'admin',
        password: '',
        bio: '',
        avatar: ''
      }
    }
  } catch (error) {
    console.error('加载个人信息失败:', error)
    ElMessage.error('获取个人信息失败')
    // 使用模拟数据
    personalInfo.value = getMockAdminInfo()
    currentUserRole.value = 'ADMIN'
    personalForm.value = {
      username: 'admin',
      account: 'admin',
      password: '',
      bio: '',
      avatar: ''
    }
  } finally {
    loading.value = false
  }
}

// 模拟管理员信息
const getMockAdminInfo = () => ({
  id: 1,
  username: 'admin',
  account: 'admin',
  bio: '系统管理员账号',
  avatar: '',
  roleType: 'ADMIN',
  createTime: '2024-01-01T10:00:00',
  deleted: false
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
    } else {
      ElMessage.error(res.data.message || '获取用户列表失败')
      users.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('获取用户列表失败')
    users.value = []
    total.value = 0
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
  // 清空本地预览和文件缓存
  editFormLocalAvatar.value = ''
  editFormAvatarFile.value = null
  editForm.value = {
    username: user.username,
    account: user.account,
    password: '',
    bio: user.bio,
    portrait: user.portrait
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
    // 检查是否有新的头像需要上传
    if (editFormAvatarFile.value) {
      const avatarRes = await uploadUserAvatar(currentUser.value.id, editFormAvatarFile.value)
      if (avatarRes.data.code === 200) {
        // 使用后端返回的正确路径
        editForm.value.portrait = avatarRes.data.data
      } else {
        ElMessage.error('头像上传失败')
        return
      }
    }
    
    // 更新用户信息
    const res = await updateUser({
      ...editForm.value,
      id: currentUser.value.id
    })

    if (res.data.code === 200) {
      // 更新列表中的用户信息
      const index = users.value.findIndex(u => u.id === currentUser.value.id)
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          username: editForm.value.username,
          account: editForm.value.account,
          bio: editForm.value.bio,
          portrait: editForm.value.portrait
        }
      }
      editDialogVisible.value = false
      // 清空本地预览和文件对象
      editFormLocalAvatar.value = ''
      editFormAvatarFile.value = null
      ElMessage.success('用户信息更新成功')
    } else {
      ElMessage.error(res.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ElMessage.error('更新用户信息失败')
  } finally {
    loading.value = false
  }
}

// 删除用户
const handleDelete = (user) => {
  ElMessageBox.confirm(`确定要删除用户 ${user.username} 吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      const res = await deleteUser()
      if (res.data.code === 200) {
        // 从列表中删除用户
        const index = users.value.findIndex(u => u.id === user.id)
        if (index !== -1) {
          users.value.splice(index, 1)
        }
        ElMessage.success('用户删除成功')
      } else {
        ElMessage.error(res.data.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除用户失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理头像上传（本地预览）
const handleAvatarUpload = (uploadFile) => {
  if (!currentUser.value) return

  // 生成本地预览URL
  const reader = new FileReader()
  reader.onload = (e) => {
    editFormLocalAvatar.value = e.target.result
  }
  reader.readAsDataURL(uploadFile.file)
  
  // 保存文件对象，用于后续上传
  editFormAvatarFile.value = uploadFile.file
  
  // 不需要立即上传，等待保存时再上传
  ElMessage.success('头像已选择，点击保存后将上传')
}

// 下载头像
const handleDownloadAvatar = async (user) => {
  if (!user.portrait && !user.avatar) {
    ElMessage.warning('当前用户没有头像')
    return
  }
  
  try {
    const portraitPath = user.portrait || user.avatar
    const res = await downloadUserAvatar(user.id, portraitPath)
    const blob = new Blob([res.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${user.username}_avatar.png`
    link.click()
    ElMessage.success('头像下载成功')
  } catch (error) {
    ElMessage.error('头像下载失败')
  }
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
    portrait: displayedUser.value.portrait
  }
  editDialogVisible.value = true
}

// 个人信息编辑对话框
const personalEditDialogVisible = ref(false)

// 打开个人信息编辑对话框
const handleEditPersonalInfo = () => {
  if (!personalInfo.value) return
  // 清空本地预览和文件缓存
  personalFormLocalAvatar.value = ''
  personalFormAvatarFile.value = null
  personalForm.value = {
    username: personalInfo.value.username,
    account: personalInfo.value.account,
    password: '',
    bio: personalInfo.value.bio,
    portrait: personalInfo.value.portrait
  }
  personalEditDialogVisible.value = true
}

// 保存个人信息
const handleSavePersonalInfo = async () => {
  if (!personalForm.value.username || !personalForm.value.account) {
    ElMessage.error('用户名和账号不能为空')
    return
  }

  loading.value = true
  try {
    // 检查是否有新的头像需要上传
    if (personalFormAvatarFile.value) {
      const avatarRes = await uploadUserAvatar(personalInfo.value.id, personalFormAvatarFile.value)
      if (avatarRes.data.code === 200) {
        // 使用后端返回的正确路径
        personalForm.value.portrait = avatarRes.data.data
      } else {
        ElMessage.error('头像上传失败')
        return
      }
    }
    
    // 更新用户信息
    const res = await updateUser({
      ...personalForm.value,
      id: personalInfo.value.id
    })

    if (res.data.code === 200) {
      // 更新个人信息
      personalInfo.value = {
        ...personalInfo.value,
        username: personalForm.value.username,
        account: personalForm.value.account,
        bio: personalForm.value.bio,
        portrait: personalForm.value.portrait
      }
      personalEditDialogVisible.value = false
      // 清空本地预览和文件对象
      personalFormLocalAvatar.value = ''
      personalFormAvatarFile.value = null
      ElMessage.success('个人信息更新成功')
    } else {
      ElMessage.error(res.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新个人信息失败')
  } finally {
    loading.value = false
  }
}

// 注销账号
const handleDeleteAccount = () => {
  if (!personalInfo.value) return

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
      console.error('注销失败:', error)
      ElMessage.error('注销失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理个人信息头像上传（本地预览）
const handlePersonalAvatarUpload = (uploadFile) => {
  if (!personalInfo.value) return

  // 生成本地预览URL
  const reader = new FileReader()
  reader.onload = (e) => {
    personalFormLocalAvatar.value = e.target.result
  }
  reader.readAsDataURL(uploadFile.file)
  
  // 保存文件对象，用于后续上传
  personalFormAvatarFile.value = uploadFile.file
  
  // 不需要立即上传，等待保存时再上传
  ElMessage.success('头像已选择，点击保存后将上传')
}

// 下载个人头像
const handleDownloadPersonalAvatar = async () => {
  if (!personalInfo.value || !personalInfo.value.portrait) {
    ElMessage.warning('当前没有头像')
    return
  }

  try {
    const res = await downloadUserAvatar(personalInfo.value.id, personalInfo.value.portrait)
    // 创建下载链接
    const blob = new Blob([res.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${personalInfo.value.username}_avatar.png`
    link.click()
    ElMessage.success('头像下载成功')
  } catch (error) {
    console.error('头像下载失败:', error)
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
    
    <!-- 模式切换 -->
    <el-card class="mode-card" shadow="never">
      <el-radio-group v-model="mainMode">
        <el-radio-button label="personal">个人信息</el-radio-button>
        <el-radio-button label="search">用户搜索</el-radio-button>
      </el-radio-group>
    </el-card>
    
    <!-- 个人信息模式 -->
    <template v-if="mainMode === 'personal'">
      <el-card v-if="personalInfo" shadow="hover" class="user-info-card">
        <div class="user-info-header">
          <el-avatar :size="100" :src="personalInfo.avatar">
            <User v-if="!personalInfo.avatar" />
          </el-avatar>
          <div class="user-info-basic">
            <h3>{{ personalInfo.username }}</h3>
          </div>
        </div>
        
        <el-descriptions :column="1" border class="user-info-detail">
          <el-descriptions-item label="账号">{{ personalInfo.account }}</el-descriptions-item>
          <el-descriptions-item label="用户类型">
            <el-tag :type="getRoleTypeTagType(personalInfo.roleType)">
              {{ getRoleTypeLabel(personalInfo.roleType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ personalInfo.createTime }}</el-descriptions-item>
          <el-descriptions-item label="简介" :span="1" style="min-height: 120px; vertical-align: top;">
            <div class="bio-textarea">
              {{ personalInfo.bio || '暂无简介' }}
              <el-alert
                v-if="!personalInfo.bio"
                type="info"
                :closable="false"
                show-icon
                style="margin-top: 10px;"
              >
                <template #default>
                  <div>示例：系统管理员，负责平台的整体运营和管理</div>
                </template>
              </el-alert>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="user-info-actions">
          <el-button type="primary" @click="handleEditPersonalInfo">
            <Edit /> 修改信息
          </el-button>
          <el-button type="danger" @click="handleDeleteAccount">
            <Delete /> 注销账号
          </el-button>
          <el-button @click="handleDownloadPersonalAvatar" :disabled="!personalInfo.avatar">
            <Download /> 下载头像
          </el-button>
        </div>
      </el-card>
    </template>
    
    <!-- 搜索模式 -->
    <template v-else>
      <!-- 搜索模式切换 -->
      <el-card class="search-mode-card" shadow="never">
        <el-radio-group v-model="searchMode" @change="handleReset">
          <el-radio-button label="advanced">高级搜索</el-radio-button>
          <el-radio-button label="keyword">关键字搜索</el-radio-button>
        </el-radio-group>
      </el-card>
      

      
      <!-- 高级搜索区域 -->
      <el-card v-if="searchMode === 'advanced'" class="search-card" shadow="never">
        <el-form :model="advancedSearchForm" label-width="140px" class="search-form" inline>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="账号" style="width: 100%;">
                <el-input v-model="advancedSearchForm.account" placeholder="请输入账号" clearable style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="用户名" style="width: 100%;">
                <el-input v-model="advancedSearchForm.username" placeholder="请输入用户名" clearable style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="用户类型" style="width: 100%;">
                <el-select v-model="advancedSearchForm.roleType" placeholder="请选择用户类型" clearable style="width: 100%;">
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
              <el-form-item label="创建时间" style="width: 100%;">
                <el-date-picker
                  v-model="advancedSearchForm.startCreateTime"
                  type="datetime"
                  placeholder="起始时间"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  style="width: 48%;"
                />
                <span style="margin: 0 4%;">-</span>
                <el-date-picker
                  v-model="advancedSearchForm.endCreateTime"
                  type="datetime"
                  placeholder="结束时间"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  style="width: 48%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item style="width: 100%;">
                <el-checkbox v-model="advancedSearchForm.filterDeleted">过滤已注销用户</el-checkbox>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="排序方式" style="width: 100%;">
                <el-select v-model="advancedSearchForm.sortType" style="width: 100%;">
                  <el-option label="按创建时间排序" :value="0" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="排序方向" style="width: 100%;">
                <el-radio-group v-model="advancedSearchForm.isAsc">
                  <el-radio-button :label="true">升序</el-radio-button>
                  <el-radio-button :label="false">降序</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item style="width: 100%;">
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
        <el-form :model="keywordSearchForm" label-width="220px" class="search-form" inline>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="账号关键字" style="width: 100%;">
                <el-input v-model="keywordSearchForm.account" placeholder="请输入账号关键字" clearable style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="用户名关键字" style="width: 100%;">
                <el-input v-model="keywordSearchForm.username" placeholder="请输入用户名关键字" clearable style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="排序方向" style="width: 100%;">
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
              <el-avatar :size="50" :src="row.portrait ? `http://localhost:8085/api/user/downloadUser/User/${row.portrait.replace(/^\//, '')}` : ''">
                <User v-if="!row.portrait" />
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
          <el-table-column prop="createTime" label="创建时间" width="200" />
          <el-table-column label="操作" width="450" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleViewDetail(row)" style="margin-right: 8px;">
                查看详情
              </el-button>
              <el-button type="success" size="small" @click="handleSelectUser(row)" style="margin-right: 8px;">
                选择展示
              </el-button>
              <el-button type="warning" size="small" @click="handleEdit(row)" style="margin-right: 8px;">
                <Edit /> 编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)" style="margin-right: 8px;">
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
    </template>
    
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
            :http-request="handleAvatarUpload"
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
            <el-avatar :size="100" :src="editFormLocalAvatar || (editForm.portrait ? `http://localhost:8085/api/user/downloadUser/User/${editForm.portrait.replace(/^\//, '')}` : '')" class="edit-avatar">
              <Camera v-if="!editFormLocalAvatar && !editForm.portrait" />
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
          <el-avatar :size="80" :src="userDetail.portrait ? `http://localhost:8085/api/user/downloadUser/User/${userDetail.portrait.replace(/^\//, '')}` : ''">
            <User v-if="!userDetail.portrait" />
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
    
    <!-- 个人信息编辑对话框 -->
    <el-dialog
      v-model="personalEditDialogVisible"
      title="修改个人信息"
      width="500px"
    >
      <el-form :model="personalForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :http-request="handlePersonalAvatarUpload"
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
            <el-avatar :size="100" :src="personalFormLocalAvatar || (personalForm.portrait ? `http://localhost:8085/api/user/downloadUser/User/${personalForm.portrait.replace(/^\//, '')}` : '')" class="edit-avatar">
              <User v-if="!personalFormLocalAvatar && !personalForm.portrait" />
            </el-avatar>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="personalForm.username" placeholder="请输入用户名" />
          <div class="form-tip">示例：admin</div>
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="personalForm.account" placeholder="请输入账号" />
          <div class="form-tip">示例：admin</div>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="personalForm.password" type="password" placeholder="请输入密码（留空表示不修改）" />
          <div class="form-tip">示例：admin123</div>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="personalForm.bio" type="textarea" placeholder="请输入简介" />
          <div class="form-tip">示例：系统管理员，负责平台的整体运营和管理</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="personalEditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePersonalInfo" :loading="loading">保存</el-button>
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

.search-mode-card {
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
  margin: 0 0 5px 0;
  font-size: 24px;
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  font-style: italic;
}

.bio-textarea {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  min-height: 100px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  background-color: #f9f9f9;
  font-size: 14px;
  font-family: inherit;
  color: #303133;
}
</style>
