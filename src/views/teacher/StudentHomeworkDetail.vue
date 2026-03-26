<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getStudentHomeworkDetail, evaluateHomework } from '../../api/homework'

const route = useRoute()
const router = useRouter()
const studentId = route.params.studentId
const homeworkId = route.params.homeworkId

const studentHomework = ref(null)
const loading = ref(false)
const evaluateForm = ref({
  score: '',
  evaluation: ''
})

onMounted(async () => {
  await loadStudentHomeworkDetail()
})

const loadStudentHomeworkDetail = async () => {
  loading.value = true
  try {
    const response = await getStudentHomeworkDetail(studentId, homeworkId)
    studentHomework.value = response.data
    if (response.data.score) {
      evaluateForm.value.score = response.data.score
      evaluateForm.value.evaluation = response.data.evaluation || ''
    }
  } catch (error) {
    ElMessage.error('获取学生作业详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleEvaluate = async () => {
  loading.value = true
  try {
    await evaluateHomework({
      studentId: studentId,
      homeworkId: homeworkId,
      score: evaluateForm.value.score,
      evaluation: evaluateForm.value.evaluation
    })
    ElMessage.success('作业评定成功')
    await loadStudentHomeworkDetail()
  } catch (error) {
    ElMessage.error('作业评定失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push('/teacher/homework')
}
</script>

<template>
  <div class="student-homework-detail-container">
    <div class="header">
      <h2>学生作业详情</h2>
      <div class="actions">
        <el-button type="primary" @click="handleEvaluate" :loading="loading">评定作业</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </div>
    
    <el-card v-if="studentHomework" class="student-homework-card">
      <div class="info-section">
        <h3>作业信息</h3>
        <el-descriptions :column="2">
          <el-descriptions-item label="作业名称">{{ studentHomework.homeworkName }}</el-descriptions-item>
          <el-descriptions-item label="作业类型">{{ studentHomework.homeworkType === 'HOMEWORK' ? '作业' : '考试' }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ studentHomework.submitTime }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ studentHomework.deadline }}</el-descriptions-item>
          <el-descriptions-item label="提交状态" :span="2">
            <el-tag v-if="studentHomework.status === 'UNSUBMITTED'" type="warning">未提交</el-tag>
            <el-tag v-else-if="studentHomework.status === 'PENDING'" type="info">未评定</el-tag>
            <el-tag v-else-if="studentHomework.status === 'APPROVED'" type="success">评定通过</el-tag>
            <el-tag v-else type="danger">评定未通过</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="content-section">
        <h3>作业内容</h3>
        <div class="homework-content">{{ studentHomework.homeworkContent }}</div>
      </div>
      
      <div class="student-submission-section">
        <h3>学生提交内容</h3>
        <div class="submission-content">{{ studentHomework.submissionContent || '无提交内容' }}</div>
      </div>
      
      <div class="evaluation-section">
        <h3>作业评定</h3>
        <el-form :model="evaluateForm" label-width="100px" label-position="left">
          <el-form-item label="分数" required>
            <el-input v-model="evaluateForm.score" type="number" placeholder="请输入分数" min="0" max="100" />
          </el-form-item>
          <el-form-item label="评语">
            <el-input type="textarea" v-model="evaluateForm.evaluation" placeholder="请输入评语" rows="3" />
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.student-homework-detail-container {
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

.student-homework-card {
  margin-top: 20px;
}

.info-section,
.content-section,
.student-submission-section,
.evaluation-section {
  margin-bottom: 30px;
}

.info-section h3,
.content-section h3,
.student-submission-section h3,
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

.el-form-item {
  margin-bottom: 20px;
}

.el-input,
.el-textarea {
  width: 100%;
}
</style>