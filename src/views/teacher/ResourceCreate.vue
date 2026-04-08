<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { createCourseResource, uploadCourseResource } from '../../api/courseResource'
import { getCreateCoursePage } from '../../api/course'

const emit = defineEmits(['resource-created', 'cancel'])

const form = reactive({
  orderId: '',
  name: '',
  resourceType: '',
  courseId: ''
})

const loading = ref(false)
const courses = ref([])
const fileList = ref([])

const resourceTypeOptions = [
  { value: 'VIDEO', label: '视频' },
  { value: 'MATERIAL', label: '课件' },
  { value: 'REFERENCE', label: '参考资料' }
]

const loadCourses = async () => {
  try {
    const response = await getCreateCoursePage({
      name: "",
      subjectId: "",
      typeId: "",
      startSelectCount: "",
      endSelectCount: "",
      startCreateTime: "",
      endCreateTime: "",
      sortType: "1",
      isAsc: "true",
      pageNum: 1,
      pageSize: 100
    })
    courses.value = response.data.data.records
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + (error.message || '未知错误'))
  }
}

const handleFileChange = (file, fileList) => {
  fileList.value = fileList
}

const handleSubmit = async () => {
  loading.value = true
  try {
    console.log('开始创建教学资源，表单数据:', form)
    // 先创建教学资源，确保字段类型正确
    const createData = { ...form }
    createData.orderId = Number(createData.orderId)
    createData.courseId = Number(createData.courseId)
    // 确保uri字段存在
    createData.uri = createData.uri || ''
    const createResponse = await createCourseResource(createData)
    console.log('创建教学资源响应:', createResponse)
    const resourceId = createResponse.data.data
    
    // 如果有文件，上传附件
    if (fileList.value.length > 0) {
      console.log('开始上传附件，课程ID: null')
      console.log('文件信息:', fileList.value[0])
      await uploadCourseResource(null, fileList.value[0].raw)
      console.log('附件上传成功')
    }
    
    ElMessage.success('教学资源创建成功')
    emit('resource-created')
  } catch (error) {
    console.error('教学资源创建失败:', error)
    console.error('错误响应:', error.response)
    let errorMessage = '教学资源创建失败'
    if (error.response && error.response.data && error.response.data.msg) {
      errorMessage = '教学资源创建失败: ' + error.response.data.msg
    } else if (error.message) {
      errorMessage = '教学资源创建失败: ' + error.message
    }
    ElMessage.error(errorMessage)
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
    <el-form :model="form" label-width="120px" label-position="left">
      <el-form-item label="排序ID" required>
        <el-input v-model="form.orderId" type="number" style="width: 100%"></el-input>
      </el-form-item>
      <el-form-item label="资源名称" required>
        <el-input v-model="form.name" style="width: 100%"></el-input>
      </el-form-item>
      <el-form-item label="资源类型" required>
        <el-select v-model="form.resourceType" style="width: 100%">
          <el-option v-for="(option, index) in resourceTypeOptions" :key="index" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="课程" required>
        <el-select v-model="form.courseId" style="width: 100%">
          <el-option v-for="(course, index) in courses" :key="index" :label="course.name || course.courseName" :value="course.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="资源文件">
        <el-upload
          class="upload-demo"
          :action="''"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="1"
        >
          <el-button type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持上传视频、课件、参考资料等文件
            </div>
          </template>
        </el-upload>
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
  width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input,
.el-select {
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