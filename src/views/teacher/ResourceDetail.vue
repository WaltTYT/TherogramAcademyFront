<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getCourseResourceDetail, modifyCourseResource, deleteCourseResource } from '../../api/courseResource'

const route = useRoute()
const router = useRouter()
const resourceId = route.params.id

const resource = ref(null)
const loading = ref(false)

const form = ref({
  sortId: '',
  resourceName: '',
  resourceType: '',
  courseId: ''
})

const resourceTypeOptions = [
  { value: 'VIDEO', label: '视频' },
  { value: 'MATERIAL', label: '课件' },
  { value: 'REFERENCE', label: '参考资料' }
]

onMounted(async () => {
  await loadResourceDetail()
})

const loadResourceDetail = async () => {
  loading.value = true
  try {
    const response = await getCourseResourceDetail(resourceId)
    resource.value = response.data
    form.value = {
      sortId: response.data.sortId,
      resourceName: response.data.resourceName,
      resourceType: response.data.resourceType,
      courseId: response.data.courseId
    }
  } catch (error) {
    ElMessage.error('获取教学资源详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  loading.value = true
  try {
    await modifyCourseResource({ ...form.value, id: resourceId })
    ElMessage.success('教学资源更新成功')
    await loadResourceDetail()
  } catch (error) {
    ElMessage.error('教学资源更新失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (confirm('确定要删除这个教学资源吗？')) {
    loading.value = true
    try {
      await deleteCourseResource(resourceId)
      ElMessage.success('教学资源删除成功')
      router.push('/teacher/resource')
    } catch (error) {
      ElMessage.error('教学资源删除失败：' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }
}

const handleBack = () => {
  router.push('/teacher/resource')
}
</script>

<template>
  <div class="resource-detail-container">
    <div class="header">
      <h2>教学资源详情</h2>
      <div class="actions">
        <el-button type="primary" @click="handleUpdate" :loading="loading">更新资源</el-button>
        <el-button type="danger" @click="handleDelete" :loading="loading">删除资源</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </div>
    
    <el-card v-if="resource" class="resource-card">
      <el-form :model="form" label-width="100px" label-position="left">
        <el-form-item label="排序ID" required>
          <el-input v-model="form.sortId" type="number" placeholder="请输入排序ID" />
        </el-form-item>
        <el-form-item label="资源名称" required>
          <el-input v-model="form.resourceName" placeholder="请输入资源名称" />
        </el-form-item>
        <el-form-item label="资源类型" required>
          <el-select v-model="form.resourceType" placeholder="请选择资源类型">
            <el-option v-for="option in resourceTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程ID" required>
          <el-input v-model="form.courseId" placeholder="课程ID" disabled />
        </el-form-item>
      </el-form>
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

.el-form-item {
  margin-bottom: 20px;
}

.el-input,
.el-select {
  width: 100%;
}
</style>