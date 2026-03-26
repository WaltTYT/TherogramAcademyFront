<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElCard, ElButton, ElIcon } from 'element-plus'
import { Document, Check, Timer, DataAnalysis } from '@element-plus/icons-vue'
import * as courseApi from '../../api/course'
import * as homeworkApi from '../../api/homework'

const router = useRouter()
const userStore = useUserStore()

const courseCount = ref(0)
const completedCourseCount = ref(0)
const pendingHomeworkCount = ref(0)
const learningHours = ref(0)

const handleEnterSelectCourse = () => {
  router.push('/student/select-course')
}

const handleEnterMyCourse = () => {
  router.push('/student/my-course')
}

const handleEnterMyHomework = () => {
  router.push('/student/my-homework')
}

const handleEnterStatistic = () => {
  router.push('/student/statistic')
}

onMounted(async () => {
  try {
    // 模拟数据，实际应该从后端获取
    courseCount.value = 5
    completedCourseCount.value = 2
    pendingHomeworkCount.value = 3
    learningHours.value = 12.5
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
})
</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h2>欢迎学生使用理程学院学习系统</h2>
      <p>在这里，您可以轻松选修课程和完成作业</p>
    </div>
    
    <div class="stats-section">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon course-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ courseCount }}</div>
            <div class="stat-label">已选课程</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon completed-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ completedCourseCount }}</div>
            <div class="stat-label">已完成课程</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon homework-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ pendingHomeworkCount }}</div>
            <div class="stat-label">待完成作业</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon time-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ learningHours }}h</div>
            <div class="stat-label">学习时长</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="features-section">
      <h3 class="section-title">系统功能</h3>
      <div class="feature-grid">
        <el-card shadow="hover" class="feature-card">
          <div class="feature-content">
            <div class="feature-icon">
              <el-icon><Document /></el-icon>
            </div>
            <h4>选修课程</h4>
            <p>浏览和选修感兴趣的课程，扩展您的知识领域</p>
            <el-button type="primary" @click="handleEnterSelectCourse" class="feature-button">进入选修课程</el-button>
          </div>
        </el-card>
        <el-card shadow="hover" class="feature-card">
          <div class="feature-content">
            <div class="feature-icon">
              <el-icon><Check /></el-icon>
            </div>
            <h4>我的课程</h4>
            <p>查看已选修的课程，观看视频和下载教学资源</p>
            <el-button type="primary" @click="handleEnterMyCourse" class="feature-button">进入我的课程</el-button>
          </div>
        </el-card>
        <el-card shadow="hover" class="feature-card">
          <div class="feature-content">
            <div class="feature-icon">
              <el-icon><Document /></el-icon>
            </div>
            <h4>我的作业</h4>
            <p>查看和完成作业，提交作业并查看评定结果</p>
            <el-button type="primary" @click="handleEnterMyHomework" class="feature-button">进入我的作业</el-button>
          </div>
        </el-card>
        <el-card shadow="hover" class="feature-card">
          <div class="feature-content">
            <div class="feature-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <h4>学习统计</h4>
            <p>查看个人学习统计数据，包括学习时长、完成率、成绩等</p>
            <el-button type="primary" @click="handleEnterStatistic" class="feature-button">进入学习统计</el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

.welcome-section h2 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 15px;
}

.welcome-section p {
  font-size: 18px;
  margin: 0;
  color: #666;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
}

.stat-icon.course-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.completed-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-icon.homework-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.time-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.features-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.feature-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.feature-content {
  padding: 30px;
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.feature-content h4 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.feature-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 25px;
}

.feature-button {
  width: 100%;
  font-size: 16px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
}

.feature-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.feature-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 20px;
  }
  
  .welcome-section h2 {
    font-size: 24px;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-card {
    width: 100%;
  }
}
</style>