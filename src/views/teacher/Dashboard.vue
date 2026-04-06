<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElCard, ElButton, ElIcon } from 'element-plus'
import { Document, Picture, User, View } from '@element-plus/icons-vue'
import * as courseApi from '../../api/course'
import * as homeworkApi from '../../api/homework'

const router = useRouter()
const userStore = useUserStore()

const courseCount = ref(0)
const resourceCount = ref(0)
const homeworkCount = ref(0)
const studentCount = ref(0)

const handleEnterCourseManagement = () => {
  router.push('/teacher/course')
}

const handleEnterResourceManagement = () => {
  router.push('/teacher/resource')
}

const handleEnterHomeworkManagement = () => {
  router.push('/teacher/homework')
}

const handleEnterStatistic = () => {
  router.push('/teacher/statistic')
}

onMounted(async () => {
  try {
    // 模拟数据，实际应该从后端获取
    courseCount.value = 4
    resourceCount.value = 24
    homeworkCount.value = 12
    studentCount.value = 150
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
})
</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h2>欢迎教师使用理程学院管理系统</h2>
      <p>在这里，您可以轻松管理课程和教学资源</p>
    </div>
    
    <div class="stats-section">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon course-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ courseCount }}</div>
            <div class="stat-label">课程数量</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon resource-icon">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ resourceCount }}</div>
            <div class="stat-label">教学资源</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon user-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ studentCount }}</div>
            <div class="stat-label">学生人数</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon view-icon">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ homeworkCount }}</div>
            <div class="stat-label">作业数量</div>
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
            <h4>课程管理</h4>
            <p>创建、编辑和管理课程信息，包括课程详情、章节设置等</p>
            <el-button type="primary" @click="handleEnterCourseManagement" class="feature-button">进入课程管理</el-button>
          </div>
        </el-card>
        <el-card shadow="hover" class="feature-card">
          <div class="feature-content">
            <div class="feature-icon">
              <el-icon><Picture /></el-icon>
            </div>
            <h4>教学资源管理</h4>
            <p>上传、编辑和管理教学资源，包括视频、课件、参考资料等</p>
            <el-button type="primary" @click="handleEnterResourceManagement" class="feature-button">进入资源管理</el-button>
          </div>
        </el-card>
        <el-card shadow="hover" class="feature-card">
          <div class="feature-content">
            <div class="feature-icon">
              <el-icon><View /></el-icon>
            </div>
            <h4>作业管理</h4>
            <p>创建、编辑和管理作业，查看学生提交的作业并进行评定</p>
            <el-button type="primary" @click="handleEnterHomeworkManagement" class="feature-button">进入作业管理</el-button>
          </div>
        </el-card>
        <el-card shadow="hover" class="feature-card">
          <div class="feature-content">
            <div class="feature-icon">
              <el-icon><User /></el-icon>
            </div>
            <h4>教学统计</h4>
            <p>查看个人教学统计数据，包括课程完成率、学生成绩等</p>
            <el-button type="primary" @click="handleEnterStatistic" class="feature-button">进入教学统计</el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 使用全局CSS变量 */
:deep(:root) {
  --base-font-size: 18px;
}

.dashboard-container {
  width: 100%;
  height: 100%;
  padding: 30px;
  background: #f5f7fa;
  overflow-y: auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

.welcome-section h2 {
  font-size: calc(var(--base-font-size) * 1.78); /* 32px */
  font-weight: bold;
  margin-bottom: 15px;
}

.welcome-section p {
  font-size: var(--base-font-size);
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
  font-size: calc(var(--base-font-size) * 1.33); /* 24px */
}

.stat-icon.course-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.resource-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.user-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.view-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: calc(var(--base-font-size) * 1.56); /* 28px */
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: calc(var(--base-font-size) * 0.78); /* 14px */
  color: #666;
}

.features-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: calc(var(--base-font-size) * 1.33); /* 24px */
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
  font-size: calc(var(--base-font-size) * 1.33); /* 24px */
  margin-bottom: 20px;
}

.feature-content h4 {
  font-size: var(--base-font-size);
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.feature-content p {
  font-size: calc(var(--base-font-size) * 0.78); /* 14px */
  color: #666;
  line-height: 1.6;
  margin-bottom: 25px;
}

.feature-button {
  width: 100%;
  font-size: calc(var(--base-font-size) * 0.89); /* 16px */
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
    font-size: calc(var(--base-font-size) * 1.33); /* 24px */
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