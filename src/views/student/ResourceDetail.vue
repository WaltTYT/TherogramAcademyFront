<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getCourseResourceDetail, downloadCourseResource } from '../../api/courseResource'
import { Download } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const resourceId = route.params.id

const resource = ref(null)
const loading = ref(false)

onMounted(async () => {
  await loadResourceDetail()
})

const loadResourceDetail = async () => {
  loading.value = true
  try {
    const response = await getCourseResourceDetail(resourceId)
    resource.value = response.data.data
  } catch (error) {
    ElMessage.error('获取资源详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleDownloadResource = async () => {
  if (!resource.value || !resource.value.uri) {
    ElMessage.warning('该资源没有附件')
    return
  }
  
  try {
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在下载资源...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    const response = await downloadCourseResource(resource.value.uri)
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 从URL中提取文件名
    const fileName = resource.value.uri.split('/').pop()
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

const handleBack = () => {
  router.back()
}
</script>

<template>
  <div class="resource-detail-container">
    <div class="header">
      <h2>资源详情</h2>
      <div class="actions">
        <el-button 
          v-if="resource && resource.uri" 
          type="primary" 
          @click="handleDownloadResource"
          :icon="Download"
        >
          下载资源
        </el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </div>
    
    <el-card v-if="resource" class="resource-card">
      <div class="info-section">
        <h3>{{ resource.name }}</h3>
        <el-descriptions :column="2">
          <el-descriptions-item label="资源类型">
            {{ resource.resourceType === 'VIDEO' ? '视频' : resource.resourceType === 'MATERIAL' ? '课件' : '参考资料' }}
          </el-descriptions-item>
          <el-descriptions-item label="查看次数">{{ resource.viewCount }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ resource.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ resource.updateTime }}</el-descriptions-item>
          <el-descriptions-item v-if="resource.uri" label="资源路径" :span="2">
            {{ resource.uri }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.resource-detail-container {
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

.resource-card {
  margin-top: 20px;
}

.info-section h3 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}
</style>