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
    <el-form :model="form" label-width="120px" label-position="left">
      <el-form-item label="作业名称" required>
        <el-input v-model="form.homeworkName" style="width: 100%"></el-input>
      </el-form-item>
      <el-form-item label="作业类型" required>
        <el-select v-model="form.homeworkType" style="width: 100%">
          <el-option v-for="(option, index) in homeworkTypeOptions" :key="index" :label="option.label" :value="option.value" />
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
        <el-select v-model="form.courseId" style="width: 100%">
          <el-option v-for="(course, index) in courses" :key="index" :label="course.courseName" :value="course.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="作业内容" required>
        <el-input type="textarea" v-model="form.homeworkContent" rows="5" style="width: 100%"></el-input>
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
  width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input,
.el-select,
.el-textarea,
.el-date-picker {
  width: 100%;
  min-width: 500px;
}

.el-button {
  margin-right: 10px;
}

/* 选择框样式优化 */
:deep(.el-select) {
  min-width: 500px;
  width: 100%;
}

:deep(.el-select .el-select__input) {
  padding-left: 10px;
  width: 100%;
}

:deep(.el-select .el-select__caret) {
  right: 10px;
}

:deep(.el-select .el-select__placeholder) {
  padding-left: 10px;
}

:deep(.el-select-dropdown) {
  min-width: 500px;
}

/* 输入框样式优化 */
:deep(.el-input) {
  min-width: 500px;
  width: 100%;
}

:deep(.el-input__inner) {
  padding-left: 10px;
  width: 100%;
}

/* 对话框样式优化 */
:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}

:deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button--danger) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

:deep(.el-button:hover) {
  opacity: 0.8;
}
</style>