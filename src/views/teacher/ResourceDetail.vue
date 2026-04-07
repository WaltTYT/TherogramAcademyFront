<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElButton, ElCard, ElDescriptions, ElDescriptionsItem, ElSkeleton } from 'element-plus'
import { getCourseResourceDetail, downloadCourseResource } from '../../api/courseResource'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const resourceId = route.params.id

// 教学资源详情
const resource = ref(null)
const loading = ref(false)

// 教学资源类型选项
const resourceTypeOptions = [
  { value: 'VIDEO', label: '视频' },
  { value: 'MATERIAL', label: '课件' },
  { value: 'REFERENCE', label: '参考资料' }
]

// 获取教学资源详情
const loadResourceDetail = async () => {
  if (!resourceId) {
    ElMessage.error('资源ID不存在')
    router.push('/teacher/resource')
    return
  }
  
  loading.value = true
  try {
    const response = await getCourseResourceDetail(resourceId)
    if (response.data && response.data.code === 200) {
      resource.value = response.data.data
    } else {
      ElMessage.error('获取教学资源详情失败：' + (response.data?.message || '未知错误'))
    }
  } catch (error) {
    ElMessage.error('获取教学资源详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 下载教学资源
const handleDownload = async () => {
  if (!resource.value || !resource.value.uri || !resource.value.id) {
    ElMessage.warning('资源文件不存在或资源ID缺失')
    return
  }
  
  try {
    // 从路径中提取文件名
    const fileName = resource.value.uri.split('/').pop()
    
    const response = await downloadCourseResource(resource.value.id, fileName)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    ElMessage.error('下载教学资源失败')
  }
}

// 返回教学资源列表
const handleBack = () => {
  router.push('/teacher/resource')
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 获取教学资源详情
  loadResourceDetail()
})
</script>

<template>
  <div class="resource-detail-container">
    <div class="header">
      <el-button @click="handleBack">返回</el-button>
      <h2>教学资源详情</h2>
    </div>
    
    <div class="content" v-if="resource" :loading="loading">
      <el-card shadow="hover" class="resource-card">
        <div class="resource-header">
          <h3>{{ resource.name }}</h3>
          <div class="resource-actions">
            <el-button type="primary" @click="handleDownload">下载资源</el-button>
          </div>
        </div>
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="排序ID">
            {{ resource.orderId }}
          </el-descriptions-item>
          <el-descriptions-item label="资源类型">
            {{ resourceTypeOptions.find(t => t.value == resource.resourceType)?.label || resource.resourceType }}
          </el-descriptions-item>
          <el-descriptions-item label="课程ID">
            {{ resource.courseId }}
          </el-descriptions-item>
          <el-descriptions-item label="查看次数">
            {{ resource.viewCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ resource.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="资源文件">
            <span v-if="resource.uri">
              {{ resource.uri.split('/').pop() }}
            </span>
            <span v-else>
              暂无资源文件
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
    
    <div v-else class="loading">
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<style scoped>
.resource-detail-container {
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

.resource-card {
  margin-bottom: 20px;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.resource-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.resource-actions {
  display: flex;
  gap: 10px;
}

.loading {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 按钮样式优化 */
.el-button {
  padding: 8px 16px;
  font-size: 14px;
}

.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
</style>