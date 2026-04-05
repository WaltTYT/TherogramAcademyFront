<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getCourseDetail } from '../../api/course'
import { getCourseResourcePage, downloadCourseResource } from '../../api/courseResource'
import { getHomeworkPage } from '../../api/homework'
import { Download } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const courseId = route.params.id

const course = ref(null)
const resources = ref([])
const homeworks = ref([])
const loading = ref(false)

onMounted(async () => {
  await loadCourseDetail()
  await loadResources()
  await loadHomeworks()
})

const loadCourseDetail = async () => {
  loading.value = true
  try {
    const response = await getCourseDetail(courseId)
    course.value = response.data.data
  } catch (error) {
    ElMessage.error('获取课程详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const loadResources = async () => {
  try {
    const response = await getCourseResourcePage({ courseId: courseId, page: 1, size: 100 })
    resources.value = response.data.data.records
  } catch (error) {
    ElMessage.error('获取教学资源失败：' + (error.message || '未知错误'))
  }
}

const loadHomeworks = async () => {
  try {
    const response = await getHomeworkPage({ courseId: courseId, page: 1, size: 100 })
    homeworks.value = response.data.data.records
  } catch (error) {
    ElMessage.error('获取作业失败：' + (error.message || '未知错误'))
  }
}

const handleResourceDetail = (resourceId) => {
  // 跳转到资源详情页面
  router.push(`/student/resource/${resourceId}`)
}

const handleHomeworkDetail = (homeworkId) => {
  router.push(`/student/homework/${homeworkId}`)
}



const handleBack = () => {
  router.push('/student/my-course')
}

// 下载资源
const handleDownloadResource = async (resource) => {
  const resourcePath = resource.attachmentUrl || resource.uri
  if (!resource || !resourcePath) {
    ElMessage.warning('该资源没有附件')
    return
  }
  
  try {
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在下载资源...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    const response = await downloadCourseResource(resourcePath)
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 从URL中提取文件名
    const fileName = resourcePath.split('/').pop()
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
  <div class="course-detail-container">
    <div class="header">
      <h2>课程详情</h2>
      <el-button @click="handleBack">返回</el-button>
    </div>
    
    <el-card v-if="course" class="course-card">
      <div class="course-info">
        <h3>{{ course.name }}</h3>
        <el-descriptions :column="2">
          <el-descriptions-item label="课程简介">{{ course.profile }}</el-descriptions-item>
          <el-descriptions-item label="课程目标">{{ course.target }}</el-descriptions-item>
          <el-descriptions-item label="课程内容">{{ course.content }}</el-descriptions-item>
          <el-descriptions-item label="课程大纲">{{ course.outline }}</el-descriptions-item>
          <el-descriptions-item label="成绩" v-if="course.score" :span="2">{{ course.score }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="resources-section">
        <h3>教学资源</h3>
        <el-table :data="resources" style="width: 100%">
          <el-table-column prop="name" label="资源名称" />
          <el-table-column prop="resourceType" label="资源类型" width="120">
            <template #default="scope">
              {{ scope.row.resourceType === 'VIDEO' ? '视频' : scope.row.resourceType === 'MATERIAL' ? '课件' : '参考资料' }}
            </template>
          </el-table-column>
          <el-table-column prop="viewCount" label="查看次数" width="100" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleResourceDetail(scope.row.id)">查看详情</el-button>
              <el-button type="success" size="small" @click="handleDownloadResource(scope.row)" :icon="Download">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="homeworks-section">
        <h3>课程作业</h3>
        <el-table :data="homeworks" style="width: 100%">
          <el-table-column prop="name" label="作业名称" />
          <el-table-column prop="type" label="作业类型" width="100">
            <template #default="scope">
              {{ scope.row.type === 'HOMEWORK' ? '作业' : '考试' }}
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="截止时间" width="180" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleHomeworkDetail(scope.row.id)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.course-detail-container {
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

.course-card {
  margin-top: 20px;
}

.course-info h3 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.resources-section,
.homeworks-section {
  margin-top: 30px;
}

.resources-section h3,
.homeworks-section h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}



.el-table {
  margin-top: 20px;
}
</style>