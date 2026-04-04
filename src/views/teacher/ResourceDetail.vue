<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus'
import { getCourseResourceDetail, modifyCourseResource, deleteCourseResource } from '../../api/courseResource'
import { getCreateCoursePage } from '../../api/course'

const route = useRoute()
const router = useRouter()
const resourceId = route.params.id

const resource = ref(null)
const loading = ref(false)
const courses = ref([])
const formRef = ref(null)

const form = ref({
  sortId: '',
  resourceName: '',
  resourceType: '',
  courseId: ''
})

const rules = {
  sortId: [
    { required: true, message: '请输入排序ID', trigger: 'blur' },
    { type: 'number', message: '排序ID必须是数字', trigger: 'blur' },
    { min: 1, message: '排序ID必须大于0', trigger: 'blur' }
  ],
  resourceName: [
    { required: true, message: '请输入资源名称', trigger: 'blur' },
    { min: 1, max: 100, message: '资源名称长度应在1-100个字符之间', trigger: 'blur' }
  ],
  resourceType: [
    { required: true, message: '请选择资源类型', trigger: 'change' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ]
}

const resourceTypeOptions = [
  { value: 'VIDEO', label: '视频' },
  { value: 'MATERIAL', label: '课件' },
  { value: 'REFERENCE', label: '参考资料' }
]

onMounted(async () => {
  await loadCourses()
  await loadResourceDetail()
})

const loadCourses = async () => {
  try {
    const response = await getCreateCoursePage({ page: 1, size: 100 })
    courses.value = response.data.data.records
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + (error.message || '未知错误'))
  }
}

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
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
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
  })
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="left">
        <el-form-item label="排序ID" prop="sortId">
          <el-input v-model.number="form.sortId" type="number" placeholder="请输入排序ID" />
        </el-form-item>
        <el-form-item label="资源名称" prop="resourceName">
          <el-input v-model="form.resourceName" placeholder="请输入资源名称" />
        </el-form-item>
        <el-form-item label="资源类型" prop="resourceType">
          <el-select v-model="form.resourceType" placeholder="请选择资源类型">
            <el-option v-for="option in resourceTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择课程">
            <el-option v-for="course in courses" :key="course.id" :label="course.courseName" :value="course.id" />
          </el-select>
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