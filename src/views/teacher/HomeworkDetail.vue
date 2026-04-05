<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElButton, ElCard, ElDescriptions, ElDescriptionsItem, ElSkeleton, ElMessageBox } from 'element-plus'
import { getHomeworkDetail, deleteHomework } from '../../api/homework'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const homeworkId = route.params.id

// 作业详情
const homework = ref(null)
const loading = ref(false)

// 作业类型选项
const homeworkTypeOptions = [
  { value: 'HOMEWORK', label: '作业' },
  { value: 'EXAM', label: '考试' }
]

// 获取作业详情
const loadHomeworkDetail = async () => {
  if (!homeworkId) {
    ElMessage.error('作业ID不存在')
    router.push('/teacher/homework')
    return
  }
  
  loading.value = true
  try {
    const response = await getHomeworkDetail(homeworkId)
    if (response.data && response.data.code === 200) {
      homework.value = response.data.data
    } else {
      ElMessage.error('获取作业详情失败：' + (response.data?.message || '未知错误'))
    }
  } catch (error) {
    ElMessage.error('获取作业详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 下载作业
const handleDownload = () => {
  if (!homework.value || !homework.value.attachment) {
    ElMessage.warning('作业附件不存在')
    return
  }
  
  // 构建下载链接
  window.location.href = `http://localhost:8085/api/homework/downloadHomework${homework.value.attachment}`
}

// 返回作业列表
const handleBack = () => {
  router.push('/teacher/homework')
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 获取作业详情
  loadHomeworkDetail()
})
</script>

<template>
  <div class="homework-detail-container">
    <div class="header">
      <el-button @click="handleBack" class="back-button">返回</el-button>
      <h2>作业详情</h2>
      <div class="actions">
        <el-button type="primary" @click="handleDownload">下载作业</el-button>
      </div>
    </div>
    
    <el-card v-loading="loading" class="homework-card" :body-style="{ padding: '20px' }">
      <template #header>
        <div class="card-header">
          <h3>{{ homework?.name || homework?.homeworkName }}</h3>
        </div>
      </template>
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="作业类型">
          {{ (homeworkTypeOptions.find(option => option.value === (homework?.type || homework?.homeworkType))?.label) || (homework?.type || homework?.homeworkType) }}
        </el-descriptions-item>
        <el-descriptions-item label="截止时间">
          {{ homework?.deadline }}
        </el-descriptions-item>
        <el-descriptions-item label="提交人数">
          {{ homework?.submitCount || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="课程ID">
          {{ homework?.courseId }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ homework?.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="作业内容" :span="1">
          {{ homework?.content || homework?.homeworkContent }}
        </el-descriptions-item>
        <el-descriptions-item label="作业附件" v-if="homework?.attachment">
          {{ homework.attachment.split('/').pop() }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style scoped>
.homework-detail-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.back-button {
  font-size: 14px;
  padding: 6px 12px;
}

.header h2 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
  flex: 1;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions .el-button {
  font-size: 14px;
  padding: 8px 16px;
}

.homework-card {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

:deep(.el-card__body) {
  padding: 20px !important;
}

:deep(.el-descriptions) {
  margin-top: 16px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 100px;
}

:deep(.el-descriptions__content) {
  color: #303133;
  line-height: 1.5;
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

:deep(.el-descriptions__bordered .el-descriptions__row) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-descriptions__bordered .el-descriptions__cell:last-child) {
  border-right: none;
}

:deep(.el-descriptions__bordered .el-descriptions__header) {
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-descriptions__bordered .el-descriptions__body) {
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .homework-detail-container {
    padding: 16px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  :deep(.el-descriptions__cell) {
    padding: 10px 12px;
  }
  
  :deep(.el-descriptions__label) {
    min-width: 80px;
  }
}
</style>