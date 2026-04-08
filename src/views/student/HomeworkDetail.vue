<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getHomeworkDetail, downloadHomework, downloadStudentHomework } from '../../api/homework'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const homeworkId = route.params.id
const userStore = useUserStore()

const homework = ref(null)
const loading = ref(false)

onMounted(async () => {
  await loadHomeworkDetail()
})

const loadHomeworkDetail = async () => {
  loading.value = true
  try {
    const response = await getHomeworkDetail(homeworkId)
    homework.value = response.data.data
  } catch (error) {
    ElMessage.error('获取作业详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  router.push(`/student/homework/${homeworkId}/submit`)
}

const handleBack = () => {
  router.push('/student/my-homework')
}

// 下载作业附件
const downloadHomeworkFile = async () => {
  if (!homework.value || !homework.value.attachment) {
    ElMessage.warning('作业附件不存在')
    return
  }
  
  try {
    // 从attachment中提取文件名
    const fileName = homework.value.attachment.split('/').pop()
    const response = await downloadHomework(homework.value.id, fileName)
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
const downloadMySubmission = async () => {
  if (!homework.value || !homework.value.studentHomeworkAttachment) {
    ElMessage.warning('学生作业附件不存在')
    return
  }
  
  try {
    // 从studentHomeworkAttachment中提取文件名
    const fileName = homework.value.studentHomeworkAttachment.split('/').pop()
    
    // 获取学生ID
    let studentId = userStore.userId
    if (!studentId) {
      // 尝试从userInfo中获取
      studentId = userStore.userInfo?.id
    }
    
    if (!studentId) {
      ElMessage.error('无法获取学生信息，无法下载附件')
      return
    }
    
    console.log('学生ID:', studentId)
    console.log('作业ID:', homework.value.id)
    console.log('文件名:', fileName)
    
    const response = await downloadStudentHomework(studentId, homework.value.id, fileName)
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

</script>

<template>
  <div class="homework-detail-container">
    <div class="header">
      <h2>作业详情</h2>
      <div class="actions">

        <el-button v-if="homework && homework.reviewStatus === 'UNSUBMITTED'" type="primary" @click="handleSubmit">提交作业</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </div>
    
    <el-card v-if="homework" class="homework-card">
      <div class="info-section">
        <h3>作业信息</h3>
        <el-descriptions :column="2">
          <el-descriptions-item label="作业名称">{{ homework.name }}</el-descriptions-item>
          <el-descriptions-item label="作业类型">{{ homework.type === 'HOMEWORK' ? '作业' : '考试' }}</el-descriptions-item>
          <el-descriptions-item label="课程名称">{{ homework.courseName || '未知课程' }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ homework.deadline }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ homework.studentHomeworkSubmitTime || '未提交' }}</el-descriptions-item>
          <el-descriptions-item label="提交状态" :span="2">
            <el-tag v-if="homework.reviewStatus === 'UNSUBMITTED'" type="warning">未提交</el-tag>
            <el-tag v-else-if="homework.reviewStatus === 'PENDING'" type="info">未评定</el-tag>
            <el-tag v-else-if="homework.reviewStatus === 'APPROVED'" type="success">评定通过</el-tag>
            <el-tag v-else-if="homework.reviewStatus === 'REJECTED'" type="danger">评定未通过</el-tag>
            <el-tag v-else type="info">未提交</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="homework.attachment" label="作业附件" :span="2">
            {{ homework.attachment.split('/').pop() }}
            <el-button type="primary" size="small" @click="downloadHomeworkFile" style="margin-left: 10px;">下载</el-button>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="content-section">
        <h3>作业内容</h3>
        <div class="homework-content">{{ homework.content || '无作业内容' }}</div>
      </div>
      
      <div v-if="homework.reviewStatus !== 'UNSUBMITTED'" class="submission-section">
        <h3>我的提交</h3>
        <div class="submission-content">{{ homework.studentHomeworkContent || '无提交内容' }}</div>
        <div v-if="homework.studentHomeworkAttachment" style="margin-top: 15px;">
          <span>提交附件：{{ homework.studentHomeworkAttachment.split('/').pop() }}</span>
          <el-button type="primary" size="small" @click="downloadMySubmission" style="margin-left: 10px;">下载</el-button>
        </div>
      </div>
      
      <div v-if="homework.reviewStatus === 'APPROVED' || homework.reviewStatus === 'REJECTED'" class="evaluation-section">
        <h3>老师评定</h3>
        <el-descriptions :column="1">
          <el-descriptions-item label="分数">{{ homework.score }}</el-descriptions-item>
          <el-descriptions-item label="评语">{{ homework.rejectedReason || '无评语' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.homework-detail-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.homework-card {
  margin-top: 20px;
}

.info-section,
.content-section,
.submission-section,
.evaluation-section {
  margin-bottom: 30px;
}

.info-section h3,
.content-section h3,
.submission-section h3,
.evaluation-section h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.homework-content,
.submission-content {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  min-height: 100px;
  white-space: pre-wrap;
}
</style>
