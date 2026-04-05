<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElButton, ElCard, ElDescriptions, ElDescriptionsItem, ElTag, ElSkeleton } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { getCreateCourseDetail, modifyCourse, deleteCourse, evaluateCourse } from '../../api/course'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const courseId = route.params.id

// 课程详情
const course = ref(null)
const loading = ref(false)

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
const loadCourseDetail = async () => {
  if (!courseId) {
    ElMessage.error('课程ID不存在')
    router.push('/teacher/course')
    return
  }
  
  loading.value = true
  try {
    const response = await getCreateCourseDetail(courseId)
    
    if (response.data.code === 200) {
      // 映射后端返回的字段名到前端使用的字段名
      course.value = {
        ...response.data.data,
        courseName: response.data.data.name || response.data.data.courseName,
        courseIntroduction: response.data.data.profile || response.data.data.courseIntroduction,
        courseObjective: response.data.data.target || response.data.data.courseObjective,
        courseContent: response.data.data.content || response.data.data.courseContent,
        courseOutline: response.data.data.outline || response.data.data.courseOutline,
        courseSubject: response.data.data.subjectId || response.data.data.courseSubject,
        courseType: response.data.data.typeId || response.data.data.courseType
      }
    } else {
      ElMessage.error(response.data.message || '获取课程详情失败')
    }
  } catch (error) {
    ElMessage.error('获取课程详情失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 返回课程列表
const handleBack = () => {
  router.push('/teacher/course')
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 获取课程详情
  loadCourseDetail()
})
</script>

<template>
  <div class="course-detail">
    <div class="header">
      <el-button @click="handleBack">返回</el-button>
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

.loading {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>