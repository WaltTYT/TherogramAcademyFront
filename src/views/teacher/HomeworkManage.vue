<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElDialog } from 'element-plus'
import { getHomeworkPage, deleteHomework } from '../../api/homework'
import { getCreateCoursePage } from '../../api/course'
import HomeworkCreate from './HomeworkCreate.vue'

const router = useRouter()

const homeworks = ref([])
const courses = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const createDialogVisible = ref(false)

const searchForm = ref({
  courseId: '',
  homeworkName: '',
  homeworkType: ''
})

const homeworkTypeOptions = [
  { value: 'HOMEWORK', label: '作业' },
  { value: 'EXAM', label: '考试' }
]

const loadCourses = async () => {
  try {
    const response = await getCreateCoursePage({ page: 1, size: 100 })
    courses.value = response.data.records
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + (error.message || '未知错误'))
  }
}

const loadHomeworks = async () => {
  loading.value = true
  try {
    const response = await getHomeworkPage({
      page: currentPage.value,
      size: pageSize.value,
      courseId: searchForm.value.courseId,
      homeworkName: searchForm.value.homeworkName,
      homeworkType: searchForm.value.homeworkType
    })
    homeworks.value = response.data.records
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('获取作业失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadHomeworks()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadHomeworks()
}

const handleCreateHomework = () => {
  createDialogVisible.value = true
}

const handleHomeworkDetail = (homeworkId) => {
  router.push(`/teacher/homework/${homeworkId}`)
}

const handleDelete = async (homeworkId) => {
  if (confirm('确定要删除这个作业吗？')) {
    loading.value = true
    try {
      await deleteHomework(homeworkId)
      ElMessage.success('作业删除成功')
      loadHomeworks()
    } catch (error) {
      ElMessage.error('作业删除失败：' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }
}

const handleHomeworkCreated = () => {
  createDialogVisible.value = false
  loadHomeworks()
}

onMounted(() => {
  loadCourses()
  loadHomeworks()
})
</script>

<template>
  <div class="homework-manage-container">
    <div class="header">
      <h2>作业管理</h2>
      <el-button type="primary" @click="handleCreateHomework">创建作业</el-button>
    </div>
    
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="课程">
          <el-select v-model="searchForm.courseId" placeholder="请选择课程" style="width: 200px;">
            <el-option v-for="course in courses" :key="course.id" :label="course.courseName" :value="course.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作业名称">
          <el-input v-model="searchForm.homeworkName" placeholder="请输入作业名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="作业类型">
          <el-select v-model="searchForm.homeworkType" placeholder="请选择作业类型" style="width: 120px;">
            <el-option v-for="option in homeworkTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" style="margin-right: 8px;">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table 
      :data="homeworks" 
      style="width: 100%" 
      :loading="loading"
      empty-text=""
      :cell-style="{ textAlign: 'center' }"
      :header-cell-style="{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f7fa' }"
    >
      <el-table-column prop="homeworkName" label="作业名称" min-width="300" />
      <el-table-column prop="courseName" label="课程名称" width="180" />
      <el-table-column prop="homeworkType" label="作业类型" width="120">
        <template #default="scope">
          {{ scope.row.homeworkType === 'HOMEWORK' ? '作业' : '考试' }}
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止时间" width="180" />
      <el-table-column prop="submitCount" label="提交人数" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleHomeworkDetail(scope.row.id)" style="margin-right: 5px">查看详情</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="empty-state">
          <el-icon class="empty-icon"><i class="el-icon-info"></i></el-icon>
          <p>暂无作业数据</p>
          <p style="font-size: 14px; color: #909399; margin-top: 8px;">请选择课程后查看作业</p>
        </div>
      </template>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="loadHomeworks"
      @current-change="handlePageChange"
    />
    
    <!-- 创建作业对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建作业"
      width="800px"
      destroy-on-close
    >
      <HomeworkCreate @homework-created="handleHomeworkCreated" @cancel="createDialogVisible = false" />
    </el-dialog>
  </div>
</template>

<style scoped>
.homework-manage-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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

/* 按钮样式优化 */
.header .el-button {
  padding: 8px 16px;
  font-size: 14px;
}

</style>