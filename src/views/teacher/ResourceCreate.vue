<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { createCourseResource } from '../../api/courseResource'
import { getCreateCoursePage } from '../../api/course'

const emit = defineEmits(['resource-created', 'cancel'])

const form = reactive({
  sortId: '',
  resourceName: '',
  resourceType: '',
  courseId: ''
})

const loading = ref(false)
const courses = ref([])

const resourceTypeOptions = [
  { value: 'VIDEO', label: '视频' },
  { value: 'MATERIAL', label: '课件' },
  { value: 'REFERENCE', label: '参考资料' }
]

const loadCourses = async () => {
  try {
    const response = await getCreateCoursePage({ page: 1, size: 100 })
    courses.value = response.data.data.records
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + (error.message || '未知错误'))
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await createCourseResource(form)
    ElMessage.success('教学资源创建成功')
    emit('resource-created')
  } catch (error) {
    ElMessage.error('教学资源创建失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

// 加载课程列表
loadCourses()
</script>

<template>
  <div class="resource-create-container">
    <el-form :model="form" label-width="100px" label-position="left">
      <el-form-item label="排序ID" required>
        <el-input v-model="form.sortId" type="number"  />
      </el-form-item>
      <el-form-item label="资源名称" required>
        <el-input v-model="form.resourceName" />
      </el-form-item>
      <el-form-item label="资源类型" required>
        <el-select v-model="form.resourceType" >
          <el-option v-for="option in resourceTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="课程" required>
        <el-select v-model="form.courseId" >
          <el-option v-for="course in courses" :key="course.id" :label="course.courseName" :value="course.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.resource-create-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-create-container h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input,
.el-select {
  width: 100%;
}

.el-button {
  margin-right: 10px;
}
</style>