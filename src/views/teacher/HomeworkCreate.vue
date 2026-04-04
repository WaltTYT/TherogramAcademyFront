<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { createHomework } from '../../api/homework'
import { getCreateCoursePage } from '../../api/course'

const emit = defineEmits(['homework-created', 'cancel'])

const form = reactive({
  homeworkName: '',
  homeworkType: '',
  deadline: '',
  homeworkContent: '',
  courseId: '',
  homeworkAttachment: ''
})

const loading = ref(false)
const courses = ref([])

const homeworkTypeOptions = [
  { value: 'HOMEWORK', label: '作业' },
  { value: 'EXAM', label: '考试' }
]

const loadCourses = async () => {
  try {
    const response = await getCreateCoursePage({ page: 1, size: 100 })
    courses.value = response.data.data.records
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + (error.message || '未知错误'))
  }
}

const handleFileChange = (file) => {
  form.homeworkAttachment = file.raw
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await createHomework(form)
    ElMessage.success('作业创建成功')
    emit('homework-created')
  } catch (error) {
    ElMessage.error('作业创建失败：' + (error.message || '未知错误'))
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
  <div class="homework-create-container">
    <el-form :model="form" label-width="100px" label-position="left">
      <el-form-item label="作业名称" required>
        <el-input v-model="form.homeworkName" />
      </el-form-item>
      <el-form-item label="作业类型" required>
        <el-select v-model="form.homeworkType" >
          <el-option v-for="option in homeworkTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="截止时间" required>
        <el-date-picker
          v-model="form.deadline"
          type="datetime"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="课程" required>
        <el-select v-model="form.courseId" >
          <el-option v-for="course in courses" :key="course.id" :label="course.courseName" :value="course.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="作业内容" required>
        <el-input type="textarea" v-model="form.homeworkContent"  rows="5" />
      </el-form-item>
      <el-form-item label="作业附件">
        <el-upload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          :limit="1"
        >
          <el-button type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">
              以上传作业附件
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.homework-create-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.homework-create-container h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input,
.el-select,
.el-textarea,
.el-date-picker {
  width: 100%;
}

.el-button {
  margin-right: 10px;
}
</style>