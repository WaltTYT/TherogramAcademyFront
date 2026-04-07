<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElInputNumber, ElDatePicker, ElSwitch, ElSelect, ElOption, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { getStudentHomeworkPage, remindHomework, getHomeworksByCourse, uploadStudentHomework, submitHomework, downloadHomework, downloadStudentHomework, getStudentHomeworkDetail } from '../../api/homework'
import { getUserDetail } from '../../api/user'

import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const homeworks = ref([])
const reminders = ref([])
const showAllReminders = ref(false)
const maxVisibleReminders = 5
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 提交作业相关
const showSubmitDialog = ref(false)
const currentHomework = ref(null)
const submitForm = ref({
  content: '',
  attachment: null
})
const uploadLoading = ref(false)

const searchForm = ref({
  homeworkName: '',
  homeworkType: '',
  status: '',
  startScore: '',
  endScore: '',
  startDeadline: '',
  endDeadline: '',
  startCreateTime: '',
  endCreateTime: '',
  startSubmitTime: '',
  endSubmitTime: '',
  sortType: 0,
  ascending: false
})

const showAdvancedSearch = ref(false)

const homeworkTypeOptions = [
  { value: 'HOMEWORK', label: '作业' },
  { value: 'EXAM', label: '考试' }
]

const statusOptions = [
  { value: 'UNSUBMITTED', label: '未提交' },
  { value: 'PENDING', label: '未评定' },
  { value: 'APPROVED', label: '评定通过' },
  { value: 'REJECTED', label: '评定未通过' }
]

const sortTypeOptions = [
  { value: 0, label: '按截至时间' },
  { value: 1, label: '按创建时间' },
  { value: 2, label: '按分数' },
  { value: 3, label: '按提交时间' }
]



const loadHomeworks = async () => {
  loading.value = true
  try {
    // 先获取用户详情，确保有学生 ID
    let studentId = userStore.userInfo?.id
    if (!studentId) {
      try {
        const userResponse = await getUserDetail()
        if (userResponse.data.code === 200 && userResponse.data.data) {
          studentId = userResponse.data.data.id
          // 更新用户信息到 store
          userStore.setUserInfo(userStore.token, userStore.roleType, userResponse.data.data)
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
        ElMessage.error('获取用户信息失败，无法查询作业')
        homeworks.value = []
        total.value = 0
        loading.value = false
        return
      }
    }
    
    console.log('开始获取作业列表，学生 ID:', studentId)
    console.log('查询参数:', {
      studentId: studentId || null,
      courseId: null,
      name: searchForm.value.homeworkName || null,
      type: searchForm.value.homeworkType || null,
      reviewStatus: searchForm.value.status || null,
      startScore: searchForm.value.startScore,
      endScore: searchForm.value.endScore,
      startDeadline: searchForm.value.startDeadline,
      endDeadline: searchForm.value.endDeadline,
      startCreateTime: searchForm.value.startCreateTime,
      endCreateTime: searchForm.value.endCreateTime,
      startSubmitTime: searchForm.value.startSubmitTime,
      endSubmitTime: searchForm.value.endSubmitTime,
      sortType: searchForm.value.sortType,
      isAsc: searchForm.value.ascending,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    // 确保学生ID存在
    if (!studentId) {
      console.error('学生ID不存在')
      ElMessage.error('学生信息不完整，无法查询作业')
      homeworks.value = []
      total.value = 0
      loading.value = false
      return
    }
    
    const response = await getStudentHomeworkPage({
      studentId: studentId,
      courseId: null,
      name: searchForm.value.homeworkName || null,
      type: searchForm.value.homeworkType || null,
      reviewStatus: searchForm.value.status || null,
      startScore: searchForm.value.startScore || null,
      endScore: searchForm.value.endScore || null,
      startDeadline: searchForm.value.startDeadline ? searchForm.value.startDeadline.replace(' ', 'T') : null,
      endDeadline: searchForm.value.endDeadline ? searchForm.value.endDeadline.replace(' ', 'T') : null,
      startCreateTime: searchForm.value.startCreateTime ? searchForm.value.startCreateTime.replace(' ', 'T') : null,
      endCreateTime: searchForm.value.endCreateTime ? searchForm.value.endCreateTime.replace(' ', 'T') : null,
      startSubmitTime: searchForm.value.startSubmitTime ? searchForm.value.startSubmitTime.replace(' ', 'T') : null,
      endSubmitTime: searchForm.value.endSubmitTime ? searchForm.value.endSubmitTime.replace(' ', 'T') : null,
      sortType: parseInt(searchForm.value.sortType),
      isAsc: searchForm.value.ascending,
      isDeleted: "false",
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    console.log('作业列表响应:', response)
    
    // 根据后端返回的数据结构调整
    if (response.data.code === 200) {
      // 检查数据结构
      if (Array.isArray(response.data.data)) {
        console.log('直接返回数组:', response.data.data)
        // 过滤掉已删除的作业
        homeworks.value = response.data.data.filter(homework => !homework.isDeleted)
        total.value = homeworks.value.length
      } else if (response.data.data && Array.isArray(response.data.data.records)) {
        // 适配分页数据结构
        console.log('返回分页数据:', response.data.data.records)
        // 过滤掉已删除的作业
        const records = response.data.data.records.filter(homework => !homework.isDeleted)
        // 处理作业数据，确保 reviewStatus 字段正确
        homeworks.value = records.map(homework => {
          // 检查作业数据结构
          console.log('作业数据:', homework)
          return homework
        })
        total.value = homeworks.value.length
      } else {
        console.log('返回数据结构异常:', response.data.data)
        homeworks.value = []
        total.value = 0
      }
      
      // 显示空数据提示
      if (homeworks.value.length === 0) {
        console.log('当前学生没有作业记录')
      }
    } else {
      console.log('返回错误:', response.data.message)
      ElMessage.error('获取作业列表失败：' + (response.data.message || '未知错误'))
      homeworks.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取作业列表失败:', error)
    ElMessage.error('获取作业列表失败：' + (error.message || '未知错误'))
    homeworks.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const loadReminders = async () => {
  try {
    console.log('开始获取作业提醒...')
    const response = await remindHomework()
    console.log('作业提醒响应:', response)
    // 根据后端返回的数据结构调整
    if (response.data.code === 200) {
      let allReminders = Array.isArray(response.data.data) ? response.data.data : []
      console.log('所有作业提醒数据:', allReminders)
      
      // 检查提醒数据的结构
      if (allReminders.length > 0) {
        console.log('提醒数据结构:', Object.keys(allReminders[0]))
      }
      
      // 获取当前学生ID
      let studentId = userStore.userInfo?.id
      if (!studentId) {
        try {
          const userResponse = await getUserDetail()
          if (userResponse.data.code === 200 && userResponse.data.data) {
            studentId = userResponse.data.data.id
          }
        } catch (error) {
          console.error('获取用户详情失败:', error)
        }
      }
      
      console.log('当前学生ID:', studentId)
      
      // 过滤只显示当前学生的作业提醒
      if (studentId) {
        // 尝试不同的字段名
        const filteredByStudentId = allReminders.filter(reminder => reminder.studentId === studentId)
        const filteredById = allReminders.filter(reminder => reminder.id === studentId)
        
        console.log('按studentId过滤结果:', filteredByStudentId)
        console.log('按id过滤结果:', filteredById)
        
        // 选择有数据的过滤结果
        if (filteredByStudentId.length > 0) {
          reminders.value = filteredByStudentId
        } else if (filteredById.length > 0) {
          reminders.value = filteredById
        } else {
          // 如果都没有，则为空
          reminders.value = []
          console.log('没有找到当前学生的作业提醒')
        }
        
        console.log('过滤后当前学生的作业提醒:', reminders.value)
      } else {
        reminders.value = []
        console.log('学生ID不存在，无法过滤作业提醒')
      }
    } else {
      console.log('获取作业提醒失败:', response.data.message)
      reminders.value = []
    }
  } catch (error) {
    console.error('获取作业提醒失败:', error)
    ElMessage.error('获取作业提醒失败：' + (error.message || '未知错误'))
    reminders.value = []
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadHomeworks()
}

const handleReset = () => {
  searchForm.value = {
    homeworkName: '',
    homeworkType: '',
    status: '',
    startScore: '',
    endScore: '',
    startDeadline: '',
    endDeadline: '',
    startCreateTime: '',
    endCreateTime: '',
    startSubmitTime: '',
    endSubmitTime: '',
    sortType: 0,
    ascending: false
  }
  currentPage.value = 1
  loadHomeworks()
}

const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
  if (!showAdvancedSearch.value) {
    searchForm.value = {
      homeworkName: '',
      homeworkType: '',
      status: '',
      startScore: '',
      endScore: '',
      startDeadline: '',
      endDeadline: '',
      startCreateTime: '',
      endCreateTime: '',
      startSubmitTime: '',
      endSubmitTime: '',
      sortType: 0,
      ascending: false
    }
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadHomeworks()
}

const handleHomeworkDetail = (homeworkId) => {
  router.push(`/student/homework/${homeworkId}`)
}



// 打开提交作业对话框
const handleSubmitHomework = (homework) => {
  currentHomework.value = homework
  submitForm.value = {
    content: '',
    attachment: null
  }
  showSubmitDialog.value = true
}

// 保存提交的作业
const saveSubmitHomework = async () => {
  if (!currentHomework.value) {
    ElMessage.error('作业信息不完整')
    return
  }
  
  try {
    // 先获取用户详情，确保有学生 ID
    let studentId = userStore.userInfo?.id
    if (!studentId) {
      try {
        const userResponse = await getUserDetail()
        if (userResponse.data.code === 200 && userResponse.data.data) {
          studentId = userResponse.data.data.id
          // 更新用户信息到 store
          userStore.setUserInfo(userStore.token, userStore.roleType, userResponse.data.data)
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
        ElMessage.error('获取用户信息失败，无法提交作业')
        return
      }
    }
    
    // 确保学生ID存在
    if (!studentId) {
      console.error('学生ID不存在')
      ElMessage.error('学生信息不完整，无法提交作业')
      return
    }
    
    // 构建提交数据
    const submitData = {
      studentId: studentId,
      homeworkId: currentHomework.value.id,
      content: submitForm.value.content
    }
    
    // 先提交作业
    const submitResponse = await submitHomework(submitData)
    console.log('作业提交响应:', submitResponse)
    
    if (submitResponse.data.code === 200) {
      // 如果有附件，上传附件
      if (submitForm.value.attachment) {
        uploadLoading.value = true
        try {
          const uploadResponse = await uploadStudentHomework(
            studentId,
            currentHomework.value.id,
            submitForm.value.attachment
          )
          console.log('附件上传响应:', uploadResponse)
          
          if (uploadResponse.data.code !== 200) {
            ElMessage.warning('作业提交成功，但附件上传失败')
          }
        } catch (error) {
          console.error('附件上传失败:', error)
          ElMessage.warning('作业提交成功，但附件上传失败')
        } finally {
          uploadLoading.value = false
        }
      }
      
      ElMessage.success('作业提交成功')
      showSubmitDialog.value = false
      // 重新加载作业列表
      loadHomeworks()
    } else {
      ElMessage.error('作业提交失败：' + (submitResponse.data.msg || '未知错误'))
    }
  } catch (error) {
    console.error('提交作业失败:', error)
    ElMessage.error('作业提交失败：' + (error.message || '未知错误'))
  }
}

// 处理文件上传
const handleFileUpload = (file) => {
  submitForm.value.attachment = file.raw
  return false // 阻止自动上传
}

// 下载作业附件
const downloadHomeworkFile = async (homework) => {
  if (!homework || !homework.attachment) {
    ElMessage.warning('作业附件不存在')
    return
  }
  
  try {
    // 从attachment中提取文件名
    const fileName = homework.attachment.split('/').pop()
    const response = await downloadHomework(homework.id, fileName)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('附件下载成功')
  } catch (error) {
    console.error('下载作业附件失败:', error)
    ElMessage.error('下载附件失败：' + (error.message || '未知错误'))
  }
}

// 下载学生作业附件
const downloadMySubmission = async (homework) => {
  if (!homework || !homework.studentHomeworkAttachment) {
    ElMessage.warning('学生作业附件不存在')
    return
  }
  
  try {
    // 从studentHomeworkAttachment中提取文件名
    const fileName = homework.studentHomeworkAttachment.split('/').pop()
    // 获取学生ID（需要从用户信息中获取）
    const userStore = useUserStore()
    const studentId = userStore.userId
    const response = await downloadStudentHomework(studentId, homework.id, fileName)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('附件下载成功')
  } catch (error) {
    console.error('下载学生作业附件失败:', error)
    ElMessage.error('下载附件失败：' + (error.message || '未知错误'))
  }
}

onMounted(() => {
  // 加载作业和提醒
  loadHomeworks()
  loadReminders()
})
</script>

<template>
  <div class="my-homework-container">
    <h2>我的作业</h2>
    
    <!-- 作业提醒 -->
    <el-card v-if="reminders.length > 0" class="reminder-card">
      <div class="reminder-header">
        <h3>作业提醒</h3>
        <el-button 
          v-if="reminders.length > maxVisibleReminders" 
          type="text" 
          @click="showAllReminders = !showAllReminders"
        >
          {{ showAllReminders ? '收起' : `查看全部(${reminders.length})` }}
        </el-button>
      </div>
      <el-alert
        v-for="(reminder, index) in (showAllReminders ? reminders : reminders.slice(0, maxVisibleReminders))"
        :key="index"
        :title="reminder.name || '未知作业'"
        :type="'warning'"
        :closable="false"
      >
        <div class="reminder-content">
          <span>截止时间：{{ reminder.deadline || '未设置' }}</span>
          <el-button type="primary" size="small" @click="handleHomeworkDetail(reminder.id)">查看详情</el-button>
        </div>
      </el-alert>
    </el-card>
    
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <!-- 基础搜索条件 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="作业类型" style="width: 100%;">
              <el-select
                v-model="searchForm.homeworkType"
                placeholder="请选择作业类型"
                clearable
                style="width: 100%;"
              >
                <el-option
                  v-for="option in homeworkTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="作业名称" style="width: 100%;">
              <el-input
                v-model="searchForm.homeworkName"
                placeholder="请输入作业名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="提交状态" style="width: 100%;">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择提交状态"
                clearable
                style="width: 100%;"
              >
                <el-option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 高级搜索条件 -->
        <el-row :gutter="20" v-if="showAdvancedSearch">
          <el-col :span="8">
            <el-form-item label="分数范围" style="width: 100%;">
              <el-input-number
                v-model="searchForm.startScore"
                placeholder="起始"
                :min="0"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-input-number
                v-model="searchForm.endScore"
                placeholder="结束"
                :min="0"
                style="width: 48%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="截止时间" style="width: 100%;">
              <el-date-picker
                v-model="searchForm.startDeadline"
                type="datetime"
                placeholder="起始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-date-picker
                v-model="searchForm.endDeadline"
                type="datetime"
                placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 48%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间" style="width: 100%;">
              <el-date-picker
                v-model="searchForm.startCreateTime"
                type="datetime"
                placeholder="起始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-date-picker
                v-model="searchForm.endCreateTime"
                type="datetime"
                placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 48%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" v-if="showAdvancedSearch">
          <el-col :span="8">
            <el-form-item label="提交时间" style="width: 100%;">
              <el-date-picker
                v-model="searchForm.startSubmitTime"
                type="datetime"
                placeholder="起始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-date-picker
                v-model="searchForm.endSubmitTime"
                type="datetime"
                placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 48%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序方式" style="width: 100%;">
              <el-select
                v-model="searchForm.sortType"
                style="width: 60%;"
              >
                <el-option
                  v-for="option in sortTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <el-switch
                v-model="searchForm.ascending"
                active-text="升序"
                inactive-text="降序"
                style="margin-left: 10px;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 按钮行（所有搜索条件的下一行） -->
        <el-row :gutter="20" style="margin-top: 15px;">
          <el-col :span="24" style="display: flex; justify-content: flex-end;">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset" style="margin-left: 10px;">重置</el-button>
            <el-button type="info" @click="toggleAdvancedSearch" style="margin-left: 10px;">
              {{ showAdvancedSearch ? '收起高级搜索' : '高级搜索' }}
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    
    <el-table 
      :data="homeworks" 
      style="width: 100%" 
      :loading="loading"
      empty-text=""
      :cell-style="{ textAlign: 'center' }"
      :header-cell-style="{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f7fa' }"
    >
      <el-table-column prop="name" label="作业名称" min-width="300" />
      <el-table-column prop="type" label="作业类型" width="180">
        <template #default="scope">
          {{ scope.row.type === 'HOMEWORK' ? '作业' : scope.row.type === 'EXAM' ? '考试' : '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止时间" width="180" />
      <el-table-column prop="studentHomeworkSubmitTime" label="提交时间" width="180" />
      <el-table-column prop="score" label="成绩" width="100">
        <template #default="scope">
          {{ scope.row.score === 'PENDING' ? '未评定' : scope.row.score }}
        </template>
      </el-table-column>
      <el-table-column prop="reviewStatus" label="提交状态" width="180">
        <template #default="scope">
          <el-tag v-if="scope.row.reviewStatus === 'UNSUBMITTED'" type="warning">未提交</el-tag>
          <el-tag v-else-if="scope.row.reviewStatus === 'PENDING'" type="info">未评定</el-tag>
          <el-tag v-else-if="scope.row.reviewStatus === 'APPROVED'" type="success">评定通过</el-tag>
          <el-tag v-else-if="scope.row.reviewStatus === 'REJECTED'" type="danger">评定未通过</el-tag>
          <el-tag v-else type="info">未提交</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="400">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleHomeworkDetail(scope.row.id)">查看</el-button>
          <el-button type="success" size="small" @click="handleSubmitHomework(scope.row)">提交</el-button>
          <el-dropdown v-if="scope.row.attachment || scope.row.studentHomeworkAttachment" style="margin-left: 10px;">
            <el-button type="info" size="small">
              下载 <el-icon class="el-icon--right"><i class="el-icon-arrow-down"></i></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="scope.row.attachment" @click="downloadHomeworkFile(scope.row)">下载作业附件</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.studentHomeworkAttachment" @click="downloadMySubmission(scope.row)">下载我的提交</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
      <template #empty>
        <div class="empty-state">
          <div class="empty-icon">
            <i class="el-icon-info"></i>
          </div>
          <p>暂无作业数据</p>
          <p style="font-size: 14px; color: #909399; margin-top: 8px;">您还没有任何作业</p>
        </div>
      </template>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="loadHomeworks"
      @current-change="handlePageChange"
    />
    
    <!-- 提交作业对话框 -->
    <el-dialog
      v-model="showSubmitDialog"
      :title="'提交作业: ' + (currentHomework?.name || '')"
      width="500px"
    >
      <el-form :model="submitForm" label-width="100px">
        <el-form-item label="作业内容">
          <el-input
            v-model="submitForm.content"
            type="textarea"
            rows="5"
            placeholder="请输入作业内容"
          />
        </el-form-item>
        <el-form-item label="上传附件">
          <el-upload
            class="upload-demo"
            action=""
            :auto-upload="false"
            :on-change="handleFileUpload"
            :show-file-list="true"
            :file-list="[]"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请选择要上传的作业文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSubmitDialog = false">取消</el-button>
          <el-button type="primary" @click="saveSubmitHomework" :loading="uploadLoading">
            提交作业
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.my-homework-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.my-homework-container h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.reminder-card {
  margin-bottom: 30px;
}

.reminder-card .reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.reminder-card h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.reminder-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.search-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-table {
  margin-bottom: 30px;
}

.el-pagination {
  display: flex;
  justify-content: flex-end;
}

/* 空态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table th) {
  border-bottom: 2px solid #e4e7ed !important;
}

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5 !important;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button:hover) {
  opacity: 0.8;
}

</style>