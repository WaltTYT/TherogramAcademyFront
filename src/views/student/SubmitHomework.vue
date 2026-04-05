<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getStudentHomeworkDetail, submitHomework, uploadStudentHomework } from '../../api/homework'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const homeworkId = route.params.id

const homework = ref(null)
const loading = ref(false)
const form = ref({
  submissionContent: ''
})
const fileList = ref([])
const uploading = ref(false)
const uploadSuccess = ref(false)

onMounted(async () => {
  await loadHomeworkDetail()
})

const loadHomeworkDetail = async () => {
  loading.value = true
  try {
    const studentId = userStore.userInfo?.id
    if (!studentId) {
      ElMessage.error('获取用户信息失败')
      return
    }
    const response = await getStudentHomeworkDetail(studentId, homeworkId)
    homework.value = response.data
  } catch (error) {
    ElMessage.error('获取作业详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleFileChange = (file) => {
  fileList.value = [file.raw]
  uploadSuccess.value = false
}

const handleUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  
  uploading.value = true
  try {
    const studentId = userStore.userInfo?.id
    if (!studentId) {
      ElMessage.error('获取用户信息失败')
      return
    }
    
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在上传附件...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    await uploadStudentHomework(studentId, homeworkId, fileList.value[0])
    uploadSuccess.value = true
    ElMessage.success('附件上传成功')
    loadingInstance.close()
  } catch (error) {
    ElMessage.error('附件上传失败：' + (error.message || '未知错误'))
  } finally {
    uploading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.submissionContent.trim()) {
    ElMessage.warning('请输入提交内容')
    return
  }
  
  loading.value = true
  try {
    const studentId = userStore.userInfo?.id
    if (!studentId) {
      ElMessage.error('获取用户信息失败')
      return
    }
    
    await submitHomework({
      homeworkId: homeworkId,
      submissionContent: form.value.submissionContent
    })
    ElMessage.success('作业提交成功')
    router.push(`/student/homework/${homeworkId}`)
  } catch (error) {
    ElMessage.error('作业提交失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push(`/student/homework/${homeworkId}`)
}
</script>

<template>
  <div class="submit-homework-container">
    <h2>提交作业</h2>
    
    <el-card v-if="homework" class="homework-card">
      <div class="homework-info">
        <h3>{{ homework.homeworkName }}</h3>
        <p class="course-name">课程：{{ homework.courseName }}</p>
        <p class="deadline">截止时间：{{ homework.deadline }}</p>
      </div>
      
      <div class="homework-content">
        <h4>作业内容</h4>
        <div class="content">{{ homework.homeworkContent }}</div>
      </div>
      
      <div class="submission-form">
        <h4>我的提交</h4>
        <el-form :model="form" label-width="100px" label-position="left">
          <el-form-item label="提交内容" required>
            <el-input type="textarea" v-model="form.submissionContent" placeholder="请输入作业内容" rows="10" />
          </el-form-item>
          <el-form-item label="附件上传">
            <el-upload
              class="upload-demo"
              :action="''"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
              :limit="1"
            >
              <el-button type="primary" :loading="uploading">点击上传</el-button>
              <template #tip>
                <div class="el-upload__tip">支持上传作业相关文件（如文档、图片等）</div>
              </template>
            </el-upload>
            <el-button 
              v-if="fileList.length > 0" 
              type="success" 
              @click="handleUpload" 
              :loading="uploading"
              style="margin-top: 10px;"
            >
              {{ uploadSuccess ? '附件已上传' : '确认上传' }}
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="loading">提交作业</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.submit-homework-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-homework-container h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.homework-card {
  margin-top: 20px;
}

.homework-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.homework-info h3 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.course-name,
.deadline {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

.homework-content {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.homework-content h4,
.submission-form h4 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.content {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  min-height: 100px;
  white-space: pre-wrap;
}

.submission-form {
  margin-top: 30px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-textarea {
  width: 100%;
}

.el-button {
  margin-right: 10px;
}
</style>