<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElButton, ElProgress, ElTabs, ElTabPane, ElCard, ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as courseApi from '../../api/course'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 课程详情
const course = ref(null)
const loading = ref(false)
const isSelected = ref(false)
const progress = ref(0)
const studyTime = ref(0)

// 课程类型和科目选项
const courseSubjects = [
  { value: 1, label: '语文' },
  { value: 2, label: '数学' },
  { value: 3, label: '英语' },
  { value: 4, label: '物理' },
  { value: 5, label: '历史' },
  { value: 6, label: '生物' },
  { value: 7, label: '化学' },
  { value: 8, label: '政治' },
  { value: 9, label: '地理' },
  { value: 10, label: '美术' },
  { value: 11, label: '音乐' },
  { value: 12, label: '体育' },
  { value: 13, label: '工学' },
  { value: 14, label: '经济学' },
  { value: 15, label: '法学' },
  { value: 16, label: '教育学' },
  { value: 17, label: '文学' },
  { value: 18, label: '历史学' },
  { value: 19, label: '理学' },
  { value: 20, label: '农学' },
  { value: 21, label: '医学' },
  { value: 22, label: '管理学' },
  { value: 23, label: '艺术学' },
  { value: 24, label: '哲学' }
]

const courseTypes = [
  { value: 1, label: '小学共享课' },
  { value: 2, label: '中学共享课' },
  { value: 3, label: '大学共享课' },
  { value: 4, label: '研究生共享课' },
  { value: 5, label: '职业教育课' },
  { value: 6, label: '虚拟实验课' },
  { value: 7, label: '社会实践课' }
]

// 获取课程详情
const getCourseDetail = async () => {
  const courseId = route.params.id
  if (!courseId) {
    ElMessage.error('课程ID不存在')
    router.push('/course')
    return
  }
  
  loading.value = true
  try {
    // 根据用户角色获取不同的课程详情
    let response
    if (userStore.roleType === 'STUDENT') {
      response = await courseApi.getSelectCourseDetail(courseId)
    } else {
      response = await courseApi.getCreateCourseDetail(courseId)
    }
    
    if (response.data.code === 200) {
      course.value = response.data.data
      // 检查是否已选修
      if (userStore.roleType === 'STUDENT' && response.data.data) {
        isSelected.value = true
        progress.value = response.data.data.progress || 0
        studyTime.value = response.data.data.studyTime || 0
      }
    } else {
      ElMessage.error(response.data.message || '获取课程详情失败')
    }
  } catch (error) {
    ElMessage.error('获取课程详情失败')
  } finally {
    loading.value = false
  }
}

// 选修课程
const selectCourse = async () => {
  const courseId = route.params.id
  try {
    const response = await courseApi.selectCourse(courseId)
    if (response.data.code === 200) {
      ElMessage.success('选修课程成功')
      isSelected.value = true
      // 重新获取课程详情
      getCourseDetail()
    } else {
      ElMessage.error(response.data.message || '选修课程失败')
    }
  } catch (error) {
    ElMessage.error('选修课程失败')
  }
}

// 退选课程
const deselectCourse = async () => {
  const courseId = route.params.id
  try {
    const response = await courseApi.deselectCourse(courseId)
    if (response.data.code === 200) {
      ElMessage.success('退选课程成功')
      isSelected.value = false
      progress.value = 0
      studyTime.value = 0
    } else {
      ElMessage.error(response.data.message || '退选课程失败')
    }
  } catch (error) {
    ElMessage.error('退选课程失败')
  }
}

// 更新课程进度
const updateProgress = async () => {
  const courseId = route.params.id
  try {
    const response = await courseApi.updateCourseProgress({
      courseId: courseId,
      progress: progress.value,
      studyTime: studyTime.value
    })
    if (response.data.code === 200) {
      ElMessage.success('更新进度成功')
    } else {
      ElMessage.error(response.data.message || '更新进度失败')
    }
  } catch (error) {
    ElMessage.error('更新进度失败')
  }
}

// 返回课程列表
const goBack = () => {
  router.push('/course')
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 获取课程详情
  getCourseDetail()
})
</script>

<template>
  <div class="course-detail">
    <div class="header">
      <el-button @click="goBack">返回</el-button>
      <h2>课程详情</h2>
    </div>
    
    <div class="content" v-if="course" :loading="loading">
      <el-card shadow="hover" class="course-card">
        <div class="course-header">
          <div class="course-info">
            <h3>{{ course.courseName }}</h3>
            <div class="course-meta">
              <el-tag>{{ courseSubjects.find(s => s.value == course.courseSubject)?.label || course.courseSubject }}</el-tag>
              <el-tag>{{ courseTypes.find(t => t.value == course.courseType)?.label || course.courseType }}</el-tag>
              <span>{{ course.createTime }}</span>
            </div>
          </div>
          <div class="course-actions">
            <el-button v-if="userStore.roleType === 'STUDENT' && !isSelected" type="primary" @click="selectCourse">选修课程</el-button>
            <el-button v-else-if="userStore.roleType === 'STUDENT' && isSelected" type="danger" @click="deselectCourse">退选课程</el-button>
          </div>
        </div>
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="课程简介">
            {{ course.courseIntroduction }}
          </el-descriptions-item>
          <el-descriptions-item label="课程目标">
            {{ course.courseObjective }}
          </el-descriptions-item>
          <el-descriptions-item label="课程内容">
            {{ course.courseContent }}
          </el-descriptions-item>
          <el-descriptions-item label="课程大纲">
            {{ course.courseOutline }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="userStore.roleType === 'STUDENT' && isSelected" class="progress-section">
          <h4>学习进度</h4>
          <el-progress :percentage="progress" :format="() => `${progress}%`" />
          <div class="progress-controls">
            <el-input-number v-model="progress" :min="0" :max="100" label="进度" />
            <el-input-number v-model="studyTime" :min="0" label="学习时间(分钟)" />
            <el-button type="primary" @click="updateProgress">更新进度</el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <div v-else class="loading">
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<style scoped>
.course-detail {
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

.course-card {
  margin-bottom: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.course-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.course-actions {
  display: flex;
  gap: 10px;
}

.progress-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.progress-section h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.progress-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 15px;
}

.loading {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>