<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { logout } from '../../api/user'
import { ElMessage } from 'element-plus'
import { HomeFilled, Document, Picture, View, User, DataAnalysis, Search } from '@element-plus/icons-vue'
import CourseManagement from './CourseManagement.vue'
import CourseDetail from './CourseDetail.vue'
import CourseResource from './CourseResource.vue'
import Homework from './Homework.vue'
import HomeworkDetail from './HomeworkDetail.vue'
import CourseStatistic from './CourseStatistic.vue'
import UserManagement from './UserManagement.vue'
import UserDetail from './UserDetail.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const searchQuery = ref('')
const activeMenu = ref('1')

// 根据当前路由设置activeMenu
const updateActiveMenu = () => {
  const path = route.path
  if (path === '/admin') {
    activeMenu.value = '1'
  } else if (path === '/admin/course') {
    activeMenu.value = '2'
  } else if (path === '/admin/course-resource') {
    activeMenu.value = '3'
  } else if (path === '/admin/homework' || path.startsWith('/admin/homework/detail/')) {
    activeMenu.value = '4'
  } else if (path === '/admin/statistics') {
    activeMenu.value = '5'
  }
}

// 初始化时更新
updateActiveMenu()

// 监听路由变化
router.afterEach(() => {
  updateActiveMenu()
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 这里可以添加搜索逻辑，例如跳转到搜索结果页面
    ElMessage.success(`搜索: ${searchQuery.value}`)
  }
}

onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    // 未登录，跳转到登录页面
    router.push('/login')
  }
})
const handleUser = () => {
  router.push('/admin/user-management')
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    // 忽略登出错误，因为即使失败也需要清除本地状态
  } finally {
    // 清除用户信息
    userStore.clearUserInfo()
    // 跳转到登录页面
    router.push('/login')
    ElMessage.success('退出登录成功')
  }
}

const currentComponent = computed(() => {
  const path = route.path
  if (path === '/admin/course') {
    return CourseManagement
  } else if (path.startsWith('/admin/course/detail/')) {
    return CourseDetail
  } else if (path === '/admin/course-resource') {
    return CourseResource
  } else if (path === '/admin/homework') {
    return Homework
  } else if (path.startsWith('/admin/homework/detail/')) {
    return HomeworkDetail
  } else if (path === '/admin/statistics') {
    return CourseStatistic
  } else if (path === '/admin/user-management') {
    return UserManagement
  } else if (path.startsWith('/admin/user-detail/')) {
    return UserDetail
  } else {
    return null
  }
})

const handleMenuSelect = (key) => {
  switch (key) {
    case '1':
      router.push('/admin')
      break
    case '2':
      router.push('/admin/course')
      break
    case '3':
      router.push('/admin/course-resource')
      break
    case '4':
      router.push('/admin/homework')
      break
    case '5':
      router.push('/admin/statistics')
      break
    default:
      break
  }
}
</script>

<template>
  <div class="home-container">
    <el-header class="header">
      <div class="header-left">
        <div class="logo">
          <img src="../../assets/logo.png" alt="理程学院" />
        </div>
      </div>
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索课程、资源或作业"
          style="width: 400px;"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
          </template>
        </el-input>
      </div>
      <div class="user-info">
        <el-button type="primary" @click="handleUser">用户管理</el-button>
        <el-button type="primary" @click="handleLogout">退出登录</el-button>
      </div>
    </el-header>
    <el-container class="main-container">
      <el-aside width="200px" class="aside">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          @select="handleMenuSelect"
        >
          <el-menu-item index="1">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><Document /></el-icon>
            <span>课程管理</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><Picture /></el-icon>
            <span>教学资源</span>
          </el-menu-item>
          <el-menu-item index="4">
            <el-icon><Document /></el-icon>
            <span>作业管理</span>
          </el-menu-item>
          <el-menu-item index="5">
            <el-icon><DataAnalysis /></el-icon>
            <span>课程统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <component :is="currentComponent" v-if="currentComponent" />
        <div v-else>
          <div class="welcome-section">
            <h2>欢迎管理员使用理程学院管理系统</h2>
            <p>在这里，您可以轻松管理课程和教学资源</p>
          </div>
          
          <div class="stats-section">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon course-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">24</div>
                  <div class="stat-label">课程总数</div>
                </div>
              </div>
            </el-card>
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon resource-icon">
                  <el-icon><Picture /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">156</div>
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
                  <div class="stat-number">328</div>
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
                  <div class="stat-number">1.2k</div>
                  <div class="stat-label">资源浏览</div>
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
                  <el-button type="primary" @click="$router.push('/admin/course')" class="feature-button">进入课程管理</el-button>
                </div>
              </el-card>
              <el-card shadow="hover" class="feature-card">
                <div class="feature-content">
                  <div class="feature-icon">
                    <el-icon><Picture /></el-icon>
                  </div>
                  <h4>教学资源管理</h4>
                  <p>上传、编辑和管理教学资源，包括视频、课件、参考资料等</p>
                  <el-button type="primary" @click="$router.push('/admin/course-resource')" class="feature-button">进入资源管理</el-button>
                </div>
              </el-card>
              <el-card shadow="hover" class="feature-card">
                <div class="feature-content">
                  <div class="feature-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <h4>作业管理</h4>
                  <p>创建、编辑和管理作业信息，包括作业详情、提交截止时间等</p>
                  <el-button type="primary" @click="$router.push('/admin/homework')" class="feature-button">进入作业管理</el-button>
                </div>
              </el-card>
              <el-card shadow="hover" class="feature-card">
                <div class="feature-content">
                  <div class="feature-icon">
                    <el-icon><DataAnalysis /></el-icon>
                  </div>
                  <h4>课程统计</h4>
                  <p>查看课程统计数据，包括课程完成率、选课人数等</p>
                  <el-button type="primary" @click="$router.push('/admin/statistics')" class="feature-button">进入课程统计</el-button>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
/* 使用全局CSS变量 */
:deep(:root) {
  --base-font-size: 18px;
}

.home-container {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.aside {
  background: #303133;
  color: white;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.aside .el-menu-vertical-demo {
  background: transparent;
  border-right: none;
  margin-top: 20px;
}

.aside .el-menu-item {
  color: #e6e6e6;
  height: 60px;
  line-height: 60px;
  margin: 0 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: var(--base-font-size);
}

.aside .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.aside .el-menu-item.is-active {
  background-color: #667eea;
  color: white;
}

.header {
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 100px;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 30px;
}

.search-container .el-input {
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f0f2f5;
  border-color: #d9d9d9;
}

.search-container .el-input__inner {
  color: #333;
  font-size: 16px;
}

.search-container .el-input__append .el-button {
  border-radius: 0 20px 20px 0;
  border-left: none;
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.search-container .el-input__append .el-button:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  /* 调整logo大小的地方 */
  max-width: 400px;
  max-height: 400px;
  width: auto;
  height: auto;
}

.header-title {
  font-size: calc(var(--base-font-size) * 1.11); /* 20px */
  font-weight: bold;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: calc(var(--base-font-size) * 0.78); /* 14px */
  color: #666;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main {
  flex: 1;
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
  .aside {
    width: 100px !important;
  }
  
  .aside .logo h1 {
    display: none;
  }
  
  .aside .el-menu-item span {
    display: none;
  }
  
  .header {
    padding: 0 20px;
  }
  
  .header-title {
    font-size: calc(var(--base-font-size) * 0.89); /* 16px */
  }
  
  .welcome-section h2 {
    font-size: calc(var(--base-font-size) * 1.33); /* 24px */
  }
  
  .main {
    padding: 20px;
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