<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElButton, ElCard, ElDescriptions, ElDescriptionsItem, ElForm, ElFormItem, ElInput, ElUpload } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as homeworkApi from '../../api/homework'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 作业详情
const homework = ref(null)
const loading = ref(false)

// 学生作业详情
const studentHomework = ref(null)

// 提交作业表单
const submitForm = ref({
  studentId: '',
  homeworkId: '',
  homeworkAnswer: '',
  score: ''
})

const submitFormRules = {
  homeworkAnswer: [
    { required: true, message: '请输入作业答案', trigger: 'blur' }
  ]
}

const submitFormRef = ref(null)

// 评定作业表单
const evaluateForm = ref({
  studentId: '',
  homeworkId: '',
  score: ''
})

const evaluateFormRules = {
  score: [
    { required: true, message: '请输入分数', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '分数必须在0-100之间', trigger: 'blur' }
  ]
}

const evaluateFormRef = ref(null)

// 上传文件
const uploadUrl = '/api/homework/uploadHomework'
const fileList = ref([])
const handleFileUpload = (response, uploadFile) => {
  if (response.data.code === 200) {
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error('文件上传失败')
  }
}

const handleFileRemove = (file, fileList) => {
  // 移除文件时的处理
}

// 获取作业详情
const getHomeworkDetail = async () => {
  const homeworkId = route.params.id
  if (!homeworkId) {
    ElMessage.error('作业ID不存在')
    router.push('/homework')
    return
  }
  
  loading.value = true
  try {
    const response = await homeworkApi.getHomeworkDetail(homeworkId)
    if (response.data.code === 200) {
      homework.value = response.data.data
    } else {
      ElMessage.error(response.data.message || '获取作业详情失败')
    }
  } catch (error) {
    ElMessage.error('获取作业详情失败')
  } finally {
    loading.value = false
  }
}

// 获取学生作业详情
const getStudentHomeworkDetail = async () => {
  const homeworkId = route.params.id
  if (!homeworkId || !userStore.userId) {
    return
  }
  
  try {
    const response = await homeworkApi.getStudentHomeworkDetail(userStore.userId, homeworkId)
    if (response.data.code === 200) {
      studentHomework.value = response.data.data
      submitForm.value.homeworkAnswer = studentHomework.value.homeworkAnswer || ''
      evaluateForm.value.score = studentHomework.value.score || ''
    }
  } catch (error) {
    // 学生未提交作业时可能会报错，忽略
  }
}

// 提交作业
const submitHomework = async () => {
  await submitFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitForm.value.studentId = userStore.userId
        submitForm.value.homeworkId = route.params.id
        const response = await homeworkApi.submitHomework(submitForm.value)
        if (response.data.code === 200) {
          ElMessage.success('提交作业成功')
          getStudentHomeworkDetail()
        } else {
          ElMessage.error(response.data.message || '提交作业失败')
        }
      } catch (error) {
        ElMessage.error('提交作业失败')
      }
    }
  })
}

// 评定作业
const evaluateHomework = async () => {
  await evaluateFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        evaluateForm.value.studentId = studentHomework.value.studentId
        evaluateForm.value.homeworkId = route.params.id
        const response = await homeworkApi.evaluateHomework(evaluateForm.value)
        if (response.data.code === 200) {
          ElMessage.success('评定作业成功')
          getStudentHomeworkDetail()
        } else {
          ElMessage.error(response.data.message || '评定作业失败')
        }
      } catch (error) {
        ElMessage.error('评定作业失败')
      }
    }
  })
}

// 下载作业附件
const downloadHomework = async () => {
  if (!homework.value || !homework.value.attachment) {
    ElMessage.warning('作业附件不存在')
    return
  }
  
  try {
    // 从attachment中提取文件名
    const fileName = homework.value.attachment.split('/').pop()
    const response = await homeworkApi.downloadHomework(homework.value.id, fileName)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    ElMessage.error('下载作业附件失败')
  }
}

// 下载学生作业附件
const downloadStudentHomework = async () => {
  if (!studentHomework.value || !studentHomework.value.studentHomeworkAttachment) {
    ElMessage.warning('学生作业附件不存在')
    return
  }
  
  try {
    const response = await homeworkApi.downloadStudentHomework(studentHomework.value.studentHomeworkAttachment)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    // 从URL中提取文件名
    const fileName = studentHomework.value.studentHomeworkAttachment.split('/').pop()
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    ElMessage.error('下载学生作业附件失败')
  }
}

// 返回作业列表
const goBack = () => {
  router.push('/admin/homework')
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 获取作业详情
  getHomeworkDetail()
  // 如果是学生，获取学生作业详情
  if (userStore.roleType === 'STUDENT') {
    getStudentHomeworkDetail()
  }
})
</script>

<template>
  <div class="homework-detail">
    <div class="header">
      <el-button @click="goBack">返回</el-button>
      <h2>作业详情</h2>
    </div>
    
    <div class="content" v-if="homework" :loading="loading">
      <el-card shadow="hover" class="homework-card">
        <div class="homework-header">
          <h3>{{ homework.name }}</h3>
          <div class="homework-actions">
            <el-button v-if="homework.attachment" @click="downloadHomework">下载作业附件</el-button>
          </div>
        </div>
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="作业类型">
            {{ homework.type === 'HOMEWORK' ? '作业' : '考试' }}
          </el-descriptions-item>
          <el-descriptions-item label="截至时间">
            {{ homework.deadline }}
          </el-descriptions-item>
          <el-descriptions-item label="提交人数">
            {{ homework.submitCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ homework.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="作业内容">
            {{ homework.content }}
          </el-descriptions-item>
          <el-descriptions-item label="作业附件">
            <span v-if="homework.attachment">
              {{ homework.attachment.split('/').pop() }}
            </span>
            <span v-else>
              暂无作业附件
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <!-- 学生提交作业 -->
      <el-card shadow="hover" class="submit-card" v-if="userStore.roleType === 'STUDENT'">
        <template #header>
          <div class="card-header">
            <span>提交作业</span>
          </div>
        </template>
        <el-form ref="submitFormRef" :model="submitForm" :rules="submitFormRules">
          <el-form-item label="作业答案" prop="homeworkAnswer">
            <el-input v-model="submitForm.homeworkAnswer" type="textarea" rows="4" placeholder="请输入作业答案" />
          </el-form-item>
          <el-form-item label="作业附件">
            <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :on-success="handleFileUpload"
              :on-remove="handleFileRemove"
              :file-list="fileList"
              :auto-upload="false"
              :data="{ studentId: userStore.userId, homeworkId: route.params.id }"
            >
              <el-button type="primary">点击上传</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传作业附件
                </div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitHomework">提交作业</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 教师评定作业 -->
      <el-card shadow="hover" class="evaluate-card" v-if="userStore.roleType !== 'STUDENT' && studentHomework">
        <template #header>
          <div class="card-header">
            <span>评定作业</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="学生ID">
            {{ studentHomework.studentId }}
          </el-descriptions-item>
          <el-descriptions-item label="作业答案">
            {{ studentHomework.homeworkAnswer }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ studentHomework.submitTime }}
          </el-descriptions-item>
          <el-descriptions-item label="学生作业附件">
            <span v-if="studentHomework.studentHomeworkAttachment">
              {{ studentHomework.studentHomeworkAttachment.split('/').pop() }}
              <el-button type="text" @click="downloadStudentHomework">下载</el-button>
            </span>
            <span v-else>
              暂无学生作业附件
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="评定状态">
            {{ 
              studentHomework.reviewStatus === 'UNSUBMITTED' ? '未提交' :
              studentHomework.reviewStatus === 'PENDING' ? '未评定' :
              studentHomework.reviewStatus === 'APPROVED' ? '评定通过' :
              studentHomework.reviewStatus === 'REJECTED' ? '评定未通过' :
              studentHomework.reviewStatus 
            }}
          </el-descriptions-item>
          <el-descriptions-item label="分数">
            {{ studentHomework.score || '未评定' }}
          </el-descriptions-item>
        </el-descriptions>
        <el-form ref="evaluateFormRef" :model="evaluateForm" :rules="evaluateFormRules" style="margin-top: 20px;">
          <el-form-item label="评定分数" prop="score">
            <el-input v-model.number="evaluateForm.score" type="number" placeholder="请输入分数" min="0" max="100" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="evaluateHomework">评定作业</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <div v-else class="loading">
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<style scoped>
.homework-detail {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0 20px;
  color: #333;
}

.content {
  min-height: 600px;
}

.homework-card,
.submit-card,
.evaluate-card {
  margin-bottom: 20px;
}

.homework-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.homework-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.homework-actions {
  display: flex;
  gap: 10px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.loading {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>