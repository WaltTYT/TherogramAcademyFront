<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElButton, ElCard, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as courseResourceApi from '../../api/courseResource'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 教学资源详情
const resource = ref(null)
const loading = ref(false)

// 教学资源类型选项
const resourceTypes = [
  { value: 'VIDEO', label: '视频' },
  { value: 'MATERIAL', label: '课件' },
  { value: 'REFERENCE', label: '参考资料' }
]

// 获取教学资源详情
const getResourceDetail = async () => {
  const resourceId = route.params.id
  if (!resourceId) {
    ElMessage.error('资源ID不存在')
    router.push('/course-resource')
    return
  }
  
  loading.value = true
  try {
    const response = await courseResourceApi.getCourseResourceDetail(resourceId)
    if (response.data.code === 200) {
      resource.value = response.data.data
    } else {
      ElMessage.error(response.data.message || '获取教学资源详情失败')
    }
  } catch (error) {
    ElMessage.error('获取教学资源详情失败')
  } finally {
    loading.value = false
  }
}

// 下载教学资源
const downloadResource = async () => {
  if (!resource.value || !resource.value.resourceUrl) {
    ElMessage.warning('资源文件不存在')
    return
  }
  
  try {
    const response = await courseResourceApi.downloadCourseResource(resource.value.resourceUrl)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    // 从URL中提取文件名
    const fileName = resource.value.resourceUrl.split('/').pop()
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    ElMessage.error('下载教学资源失败')
  }
}

// 返回教学资源列表
const goBack = () => {
  router.push('/course-resource')
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 获取教学资源详情
  getResourceDetail()
})
</script>

<template>
  <div class="course-resource-detail">
    <div class="header">
      <el-button @click="goBack">返回</el-button>
      <h2>教学资源详情</h2>
    </div>
    
    <div class="content" v-if="resource" :loading="loading">
      <el-card shadow="hover" class="resource-card">
        <div class="resource-header">
          <h3>{{ resource.resourceName }}</h3>
          <div class="resource-actions">
            <el-button type="primary" @click="downloadResource">下载资源</el-button>
          </div>
        </div>
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="排序ID">
            {{ resource.sortId }}
          </el-descriptions-item>
          <el-descriptions-item label="资源类型">
            {{ resourceTypes.find(t => t.value == resource.resourceType)?.label || resource.resourceType }}
          </el-descriptions-item>
          <el-descriptions-item label="课程ID ">
            {{ resource.courseId }}
          </el-descriptions-item>
          <el-descriptions-item label="查看次数">
            {{ resource.viewCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ resource.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="资源文件">
            <span v-if="resource.resourceUrl">
              {{ resource.resourceUrl.split('/').pop() }}
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
.course-resource-detail {
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
</style>
