<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getSelectCoursePage, deselectCourse } from '../../api/course'

const router = useRouter()

const courses = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = ref({
  courseName: '',
  courseSubject: '',
  courseType: ''
})

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

const loadCourses = async () => {
  loading.value = true
  try {
    const response = await getSelectCoursePage({
      page: currentPage.value,
      size: pageSize.value,
      courseName: searchForm.value.courseName,
      courseSubject: searchForm.value.courseSubject,
      courseType: searchForm.value.courseType
    })
    courses.value = response.data.records
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadCourses()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadCourses()
}

const handleCourseDetail = (courseId) => {
  router.push(`/student/course-detail/${courseId}`)
}

const handleDeselect = async (courseId) => {
  if (confirm('确定要退选这门课程吗？')) {
    loading.value = true
    try {
      await deselectCourse(courseId)
      ElMessage.success('退选成功')
      loadCourses()
    } catch (error) {
      ElMessage.error('退选失败：' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  loadCourses()
})
</script>

<template>
  <div class="my-course-container">
    <h2>我的课程</h2>
    
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="课程名称">
          <el-input v-model="searchForm.courseName" placeholder="请输入课程名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="课程科目">
          <el-select v-model="searchForm.courseSubject" placeholder="请选择课程科目" style="width: 150px;">
            <el-option v-for="option in courseSubjectOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select v-model="searchForm.courseType" placeholder="请选择课程类型" style="width: 180px;">
            <el-option v-for="option in courseTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" style="margin-right: 8px;">搜索</el-button>
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
      <el-table-column prop="courseName" label="课程名称" min-width="300">
        <template #default="scope">
          <span class="course-name" @click="handleCourseDetail(scope.row.id)">{{ scope.row.courseName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="courseIntroduction" label="课程简介" min-width="200" />
      <el-table-column prop="courseSubject" label="课程科目" width="120">
        <template #default="scope">
          {{ courseSubjectOptions.find(option => option.value === scope.row.courseSubject)?.label || scope.row.courseSubject }}
        </template>
      </el-table-column>
      <el-table-column prop="courseType" label="课程类型" width="120">
        <template #default="scope">
          {{ courseTypeOptions.find(option => option.value === scope.row.courseType)?.label || scope.row.courseType }}
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="学习进度" width="150">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress" :stroke-width="10" />
        </template>
      </el-table-column>
      <el-table-column prop="studyTime" label="学习时长(分钟)" width="120" />
      <el-table-column prop="score" label="成绩" width="80" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleCourseDetail(scope.row.id)" style="margin-right: 5px">查看详情</el-button>
          <el-button type="danger" size="small" @click="handleDeselect(scope.row.id)">退选</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="empty-state">
          <el-icon class="empty-icon"><i class="el-icon-info"></i></el-icon>
          <p>暂无课程数据</p>
          <p style="font-size: 14px; color: #909399; margin-top: 8px;">您还没有选择任何课程</p>
        </div>
      </template>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="loadCourses"
      @current-change="handlePageChange"
    />
  </div>
</template>

<style scoped>
.my-course-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.my-course-container h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.search-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-name {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}

.course-name:hover {
  color: #66b1ff;
}

.el-table {
  margin-bottom: 30px;
}

.el-pagination {
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

:deep(.el-button--danger) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

:deep(.el-button:hover) {
  opacity: 0.8;
}

</style>