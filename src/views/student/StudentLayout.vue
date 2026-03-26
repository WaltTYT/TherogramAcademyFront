<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { HomeFilled, Document, Picture, View, User, DataAnalysis } from '@element-plus/icons-vue'
import Dashboard from './Dashboard.vue'
import SelectCourse from './SelectCourse.vue'
import MyCourse from './MyCourse.vue'
import CourseDetail from './CourseDetail.vue'
import MyHomework from './MyHomework.vue'
import HomeworkDetail from './HomeworkDetail.vue'
import SubmitHomework from './SubmitHomework.vue'
import Statistic from './Statistic.vue'
import UserManagement from './UserManagement.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = ref('dashboard')
const showUserManagement = ref(false)

const currentComponent = computed(() => {
  const name = route.name
  if (name === 'StudentSelectCourse') return SelectCourse
  if (name === 'StudentMyCourse') return MyCourse
  if (name === 'StudentCourseDetail') return CourseDetail
  if (name === 'StudentMyHomework') return MyHomework
  if (name === 'StudentHomeworkDetail') return HomeworkDetail
  if (name === 'StudentSubmitHomework') return SubmitHomework
  if (name === 'StudentStatistic') return Statistic
  if (name === 'StudentUserManagement') return UserManagement
  return Dashboard
})

const handleMenuClick = (menu) => {
  activeMenu.value = menu
  switch (menu) {
    case 'dashboard':
      router.push('/student')
      break
    case 'select-course':
      router.push('/student/select-course')
      break
    case 'my-course':
      router.push('/student/my-course')
      break
    case 'my-homework':
      router.push('/student/my-homework')
      break
    case 'statistic':
      router.push('/student/statistic')
      break
  }
}

const handleUser = () => {
  router.push('/student/user-management')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="home-container">
    <el-header class="header">
      <div class="header-left">
        <div class="logo">
          <img src="../../assets/logo.png" alt="理程学院" />
        </div>
        <div class="header-title"></div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleUser">用户管理</el-button>
        <el-button type="primary" @click="handleLogout">退出登录</el-button>
      </div>
    </el-header>
    <div class="main-container">
      <el-aside class="aside">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="dashboard" @click="handleMenuClick('dashboard')">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="select-course" @click="handleMenuClick('select-course')">
            <el-icon><Document /></el-icon>
            <span>选修课程</span>
          </el-menu-item>
          <el-menu-item index="my-course" @click="handleMenuClick('my-course')">
            <el-icon><Picture /></el-icon>
            <span>我的课程</span>
          </el-menu-item>
          <el-menu-item index="my-homework" @click="handleMenuClick('my-homework')">
            <el-icon><View /></el-icon>
            <span>我的作业</span>
          </el-menu-item>
          <el-menu-item index="statistic" @click="handleMenuClick('statistic')">
            <el-icon><DataAnalysis /></el-icon>
            <span>学习统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <component :is="currentComponent" />
      </el-main>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 顶部栏设计 */
.header {
  height: 100px;
  background: white;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  height: 50px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.logo:hover {
  transform: scale(1.05);
}

.logo img {
  max-width: 160px;
  max-height: 160px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-right .el-button {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-right .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 主容器 */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 侧边栏设计 */
.aside {
  width: 240px;
  background: #001529;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: hidden;
  transition: all 0.3s ease;
}

.aside:hover {
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
}

/* 菜单样式 */
.el-menu-vertical-demo {
  height: 100%;
  background: transparent;
  border-right: none;
  padding: 20px 0;
}

.el-menu-item {
  height: 56px;
  line-height: 56px;
  margin: 0 16px;
  border-radius: 10px;
  transition: all 0.3s ease;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.el-menu-item.is-active {
  background: #1890ff;
  color: white;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.el-menu-item.is-active:hover {
  background: #40a9ff;
  color: white;
}

.el-menu-item i {
  font-size: 18px;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.el-menu-item.is-active i {
  transform: scale(1.1);
}

/* 主内容区 */
.main {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: #f8f9fa;
}

/* 滚动条样式 */
.main::-webkit-scrollbar {
  width: 8px;
}

.main::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.main::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 20px;
  }
  
  .logo img {
    max-width: 140px;
  }
  
  .header-title {
    display: none;
  }
  
  .aside {
    width: 80px;
  }
  
  .el-menu-item span {
    display: none;
  }
  
  .el-menu-item i {
    margin-right: 0;
    font-size: 20px;
  }
  
  .main {
    padding: 20px;
  }
}
</style>