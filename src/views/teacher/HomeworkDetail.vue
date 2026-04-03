<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getHomeworkDetail, modifyHomework, deleteHomework } from '../../api/homework'

const route = useRoute()
const router = useRouter()
const homeworkId = route.params.id

const homework = ref(null)
const loading = ref(false)

const form = ref({
  homeworkName: '',
  homeworkType: '',
  deadline: '',
  homeworkContent: '',
  courseId: ''
})

const homeworkTypeOptions = [
  { value: 'HOMEWORK', label: '作业' },
  { value: 'EXAM', label: '考试' }
]

onMounted(async () => {
  await loadHomeworkDetail()
})

const loadHomeworkDetail = async () => {
  loading.value = true
  try {
    const response = await getHomeworkDetail(homeworkId)
    homework.value = response.data
    form.value = {
      homeworkName: response.data.homeworkName,
      homeworkType: response.data.homeworkType,
      deadline: response.data.deadline,
      homeworkContent: response.data.homeworkContent,
      courseId: response.data.courseId
    }
  } catch (error) {
    ElMessage.error('获取作业详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  loading.value = true
  try {
    await modifyHomework({ ...form.value, id: homeworkId })
    ElMessage.success('作业更新成功')
    await loadHomeworkDetail()
  } catch (error) {
    ElMessage.error('作业更新失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (confirm('确定要删除这个作业吗？')) {
    loading.value = true
    try {
      await deleteHomework(homeworkId)
      ElMessage.success('作业删除成功')
      router.push('/teacher/homework')
    } catch (error) {
      ElMessage.error('作业删除失败：' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }
}

const handleBack = () => {
  router.push('/teacher/homework')
}
</script>

<template>
  <div class="homework-detail-container">
    <div class="header">
      <h2>作业详情</h2>
      <div class="actions">
        <el-button type="primary" @click="handleUpdate" :loading="loading">更新作业</el-button>
        <el-button type="danger" @click="handleDelete" :loading="loading">删除作业</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </div>
    
    <el-card v-if="homework" class="homework-card">
      <el-form :model="form" label-width="100px" label-position="left">
        <el-form-item label="作业名称" required>
          <el-input v-model="form.homeworkName" placeholder="请输入作业名称" />
        </el-form-item>
        <el-form-item label="作业类型" required>
          <el-select v-model="form.homeworkType" placeholder="请选择作业类型">
            <el-option v-for="option in homeworkTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" required>
          <el-date-picker
            v-model="form.deadline"
            type="datetime"
            placeholder="请选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="作业内容" required>
          <el-input type="textarea" v-model="form.homeworkContent" placeholder="请输入作业内容" rows="5" />
        </el-form-item>
        <el-form-item label="课程ID" required>
          <el-input v-model="form.courseId" placeholder="课程ID" disabled />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.homework-detail-container {
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

.homework-card {
  margin-top: 20px;
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
</style>