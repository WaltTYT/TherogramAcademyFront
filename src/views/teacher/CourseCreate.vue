<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { createCourse } from '../../api/course'

const router = useRouter()

const form = reactive({
  courseName: '',
  courseIntroduction: '',
  courseObjective: '',
  courseContent: '',
  courseOutline: '',
  courseSubject: '',
  courseType: ''
})

const loading = ref(false)

const courseSubjectOptions = [
  { value: '1', label: '语文' },
  { value: '2', label: '数学' },
  { value: '3', label: '英语' },
  { value: '4', label: '物理' },
  { value: '5', label: '历史' },
  { value: '6', label: '生物' },
  { value: '7', label: '化学' },
  { value: '8', label: '政治' },
  { value: '9', label: '地理' },
  { value: '10', label: '美术' },
  { value: '11', label: '音乐' },
  { value: '12', label: '体育' },
  { value: '13', label: '工学' },
  { value: '14', label: '经济学' },
  { value: '15', label: '法学' },
  { value: '16', label: '教育学' },
  { value: '17', label: '文学' },
  { value: '18', label: '历史学' },
  { value: '19', label: '理学' },
  { value: '20', label: '农学' },
  { value: '21', label: '医学' },
  { value: '22', label: '管理学' },
  { value: '23', label: '艺术学' },
  { value: '24', label: '哲学' }
]

const courseTypeOptions = [
  { value: '1', label: '小学共享课' },
  { value: '2', label: '中学共享课' },
  { value: '3', label: '大学共享课' },
  { value: '4', label: '研究生共享课' },
  { value: '5', label: '职业教育课' },
  { value: '6', label: '虚拟实验课' },
  { value: '7', label: '社会实践课' }
]

const handleSubmit = async () => {
  loading.value = true
  try {
    await createCourse(form)
    ElMessage.success('课程创建成功')
    router.push('/teacher/course')
  } catch (error) {
    ElMessage.error('课程创建失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/teacher/course')
}
</script>

<template>
  <div class="course-create-container">
    <h2>创建课程</h2>
    <el-form :model="form" label-width="100px" label-position="left">
      <el-form-item label="课程名称" required>
        <el-input v-model="form.courseName" />
      </el-form-item>
      <el-form-item label="课程简介" required>
        <el-input type="textarea" v-model="form.courseIntroduction" placeholder="请输入课程简介" rows="3" />
      </el-form-item>
      <el-form-item label="课程目标" required>
        <el-input type="textarea" v-model="form.courseObjective" placeholder="请输入课程目标" rows="3" />
      </el-form-item>
      <el-form-item label="课程内容" required>
        <el-input type="textarea" v-model="form.courseContent" placeholder="请输入课程内容" rows="5" />
      </el-form-item>
      <el-form-item label="课程大纲" required>
        <el-input type="textarea" v-model="form.courseOutline" placeholder="请输入课程大纲" rows="5" />
      </el-form-item>
      <el-form-item label="课程科目" required>
        <el-select v-model="form.courseSubject" placeholder="请选择课程科目">
          <el-option v-for="option in courseSubjectOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="课程类型" required>
        <el-select v-model="form.courseType" placeholder="请选择课程类型">
          <el-option v-for="option in courseTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
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
.course-create-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-create-container h2 {
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
.el-textarea {
  width: 100%;
}

.el-button {
  margin-right: 10px;
}
</style>