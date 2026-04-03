<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'
import { HomeFilled, Document, Picture, View, User, DataAnalysis, Search } from '@element-plus/icons-vue'
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
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 这里可以添加搜索逻辑，例如跳转到搜索结果页面
    ElMessage.success(`搜索: ${searchQuery.value}`)
  }
}

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
      <el-aside width="240px" class="aside">
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

.user-info .el-button {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: var(--base-font-size);
}

.user-info .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 主容器 */
.main-container {
  flex: 1;
  overflow: hidden;
}

/* 侧边栏设计 */
.aside {
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
  font-size: var(--base-font-size);
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
  font-size: calc(var(--base-font-size) * 1.11); /* 18px */
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
    font-size: calc(var(--base-font-size) * 1.11); /* 20px */
  }
  
  .main {
    padding: 20px;
  }
}
</style>