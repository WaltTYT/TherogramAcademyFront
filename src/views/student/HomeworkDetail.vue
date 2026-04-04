<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getStudentHomeworkDetail, downloadHomework } from '../../api/homework'
import { Download } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const homeworkId = route.params.id

const homework = ref(null)
const loading = ref(false)

onMounted(async () => {
  await loadHomeworkDetail()
})

const loadHomeworkDetail = async () => {
  loading.value = true
  try {
    const response = await getStudentHomeworkDetail(null, homeworkId)
    homework.value = response.data
  } catch (error) {
    ElMessage.error('获取作业详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  router.push(`/student/submit-homework/${homeworkId}`)
}

const handleBack = () => {
  router.push('/student/my-homework')
}

// 下载作业附件
const handleDownloadAttachment = async () => {
  if (!homework.value || !homework.value.attachmentUrl) {
    ElMessage.warning('该作业没有附件')
    return
  }
  
  try {
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在下载附件...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    const response = await downloadHomework(homework.value.attachmentUrl)
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 从URL中提取文件名
    const fileName = homework.value.attachmentUrl.split('/').pop()
    link.download = fileName
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    loadingInstance.close()
    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败：' + (error.message || '未知错误'))
  }
}
</script>

<template>
  <div class="homework-detail-container">
    <div class="header">
      <h2>作业详情</h2>
      <div class="actions">
        <el-button 
          v-if="homework && homework.attachmentUrl" 
          type="info" 
          @click="handleDownloadAttachment"
          :icon="Download"
        >
          下载附件
        </el-button>
        <el-button v-if="homework && homework.status === 'UNSUBMITTED'" type="primary" @click="handleSubmit">提交作业</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </div>
    
    <el-card v-if="homework" class="homework-card">
      <div class="info-section">
        <h3>作业信息</h3>
        <el-descriptions :column="2">
          <el-descriptions-item label="作业名称">{{ homework.homeworkName }}</el-descriptions-item>
          <el-descriptions-item label="作业类型">{{ homework.homeworkType === 'HOMEWORK' ? '作业' : '考试' }}</el-descriptions-item>
          <el-descriptions-item label="课程名称">{{ homework.courseName }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ homework.deadline }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ homework.submitTime || '未提交' }}</el-descriptions-item>
          <el-descriptions-item label="提交状态" :span="2">
            <el-tag v-if="homework.status === 'UNSUBMITTED'" type="warning">未提交</el-tag>
            <el-tag v-else-if="homework.status === 'PENDING'" type="info">未评定</el-tag>
            <el-tag v-else-if="homework.status === 'APPROVED'" type="success">评定通过</el-tag>
            <el-tag v-else type="danger">评定未通过</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="homework.attachmentUrl" label="作业附件" :span="2">
            <el-button type="text" @click="handleDownloadAttachment" :icon="Download">
              {{ homework.attachmentUrl.split('/').pop() }}
            </el-button>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="content-section">
        <h3>作业内容</h3>
        <div class="homework-content">{{ homework.homeworkContent }}</div>
      </div>
      
      <div v-if="homework.status !== 'UNSUBMITTED'" class="submission-section">
        <h3>我的提交</h3>
        <div class="submission-content">{{ homework.submissionContent || '无提交内容' }}</div>
      </div>
      
      <div v-if="homework.status === 'APPROVED' || homework.status === 'REJECTED'" class="evaluation-section">
        <h3>老师评定</h3>
        <el-descriptions :column="1">
          <el-descriptions-item label="分数">{{ homework.score }}</el-descriptions-item>
          <el-descriptions-item label="评语">{{ homework.evaluation || '无评语' }}</el-descriptions-item>
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
