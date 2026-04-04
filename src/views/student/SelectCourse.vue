<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElTable, ElTableColumn, ElButton, ElPagination, ElInput, ElSelect, ElOption, ElTag } from 'element-plus'
import * as courseApi from '../../api/course'

const router = useRouter()
const courses = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const searchKeyword = ref('')
const courseSubject = ref('')
const courseType = ref('')

const handleSelectCourse = async (courseId) => {
  try {
    await courseApi.selectCourse(courseId)
    ElMessage.success('选课成功')
    getCourses()
  } catch (error) {
    ElMessage.error('选课失败')
  }
}

const handleCourseDetail = (courseId) => {
  router.push(`/student/course/${courseId}`)
}

const getCourses = async () => {
  try {
    loading.value = true
    const response = await courseApi.getCoursePage({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      courseSubject: courseSubject.value,
      courseType: courseType.value
    })
    courses.value = response.data.data.records
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  getCourses()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  getCourses()
}

const handleCurrentChange = (current) => {
  page.value = current
  getCourses()
}

onMounted(() => {
  getCourses()
})
</script>

<template>
  <div class="select-course-container">
    <div class="header">
      <h2>选修课程</h2>
    </div>
    
    <div class="search-form">
      <el-form :model="{ searchKeyword, courseSubject, courseType }" inline>
        <el-form-item label="课程名称">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入课程名称"
            style="width: 200px;"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch" style="margin-right: 8px;"><el-icon><Search /></el-icon></el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="课程科目">
          <el-select
            v-model="courseSubject"
            placeholder="请选择课程科目"
            style="width: 150px;"
            @change="handleSearch"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="数学" value="数学"></el-option>
            <el-option label="语文" value="语文"></el-option>
            <el-option label="英语" value="英语"></el-option>
            <el-option label="物理" value="物理"></el-option>
            <el-option label="化学" value="化学"></el-option>
            <el-option label="生物" value="生物"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select
            v-model="courseType"
            placeholder="请选择课程类型"
            style="width: 150px;"
            @change="handleSearch"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="必修课" value="必修课"></el-option>
            <el-option label="选修课" value="选修课"></el-option>
            <el-option label="通识课" value="通识课"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table 
      :data="courses" 
      style="width: 100%" 
      :loading="loading"
      empty-text=""
      :cell-style="{ textAlign: 'center' }"
      :header-cell-style="{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f7fa' }"
    >
      <el-table-column prop="courseId" label="课程ID" width="100" />
      <el-table-column prop="courseName" label="课程名称" min-width="300" />
      <el-table-column prop="courseSubject" label="课程科目" width="120" />
      <el-table-column prop="courseType" label="课程类型" width="120" />
      <el-table-column prop="courseDescription" label="课程简介" min-width="200" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleCourseDetail(scope.row.courseId)" style="margin-right: 5px">查看</el-button>
          <el-button size="small" type="primary" @click="handleSelectCourse(scope.row.courseId)">选课</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="empty-state">
          <el-icon class="empty-icon"><i class="el-icon-info"></i></el-icon>
          <p>暂无课程数据</p>
          <p style="font-size: 14px; color: #909399; margin-top: 8px;">请尝试调整搜索条件</p>
        </div>
      </template>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>
  </div>
</template>

<style scoped>
.select-course-container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.search-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 空态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table th) {
  border-bottom: 2px solid #e4e7ed !important;
}

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5 !important;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button:hover) {
  opacity: 0.8;
}

</style>