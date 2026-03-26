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
    const response = await courseApi.getCourses({
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
    
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入课程名称"
        style="width: 300px; margin-right: 10px"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
      <el-select
        v-model="courseSubject"
        placeholder="课程科目"
        style="width: 150px; margin-right: 10px"
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
      <el-select
        v-model="courseType"
        placeholder="课程类型"
        style="width: 150px"
        @change="handleSearch"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="必修课" value="必修课"></el-option>
        <el-option label="选修课" value="选修课"></el-option>
        <el-option label="通识课" value="通识课"></el-option>
      </el-select>
    </div>
    
    <el-table :data="courses" style="width: 100%" :loading="loading">
      <el-table-column prop="courseId" label="课程ID" width="80" />
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="courseSubject" label="课程科目" />
      <el-table-column prop="courseType" label="课程类型" />
      <el-table-column prop="courseDescription" label="课程简介" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="handleCourseDetail(scope.row.courseId)">查看</el-button>
          <el-button size="small" type="primary" @click="handleSelectCourse(scope.row.courseId)">选课</el-button>
        </template>
      </el-table-column>
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

.search-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>