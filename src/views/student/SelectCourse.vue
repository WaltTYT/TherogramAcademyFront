<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElTable, ElTableColumn, ElButton, ElPagination, ElInput, ElSelect, ElOption, ElDatePicker, ElSwitch } from 'element-plus'
import * as courseApi from '../../api/course'

const router = useRouter()
const courses = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 是否显示高级搜索
const showAdvancedSearch = ref(false)

// 搜索表单
const searchForm = ref({
  courseName: '',
  courseSubject: '',
  courseType: '',
  startSelectCount: '',
  endSelectCount: '',
  startCreateTime: '2025-01-01T00:00:00',
  endCreateTime: '2027-01-01T12:00:00',
  sortType: '0',
  ascending: true
})

// 课程科目选项（1-24）
const courseSubjectOptions = [
  { value: '', label: '全部' },
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

// 课程类型选项（1-7）
const courseTypeOptions = [
  { value: '', label: '全部' },
  { value: '1', label: '小学共享课' },
  { value: '2', label: '中学共享课' },
  { value: '3', label: '大学共享课' },
  { value: '4', label: '研究生共享课' },
  { value: '5', label: '职业教育课' },
  { value: '6', label: '虚拟实验课' },
  { value: '7', label: '社会实践课' }
]

// 排序方式选项
const sortTypeOptions = [
  { value: '0', label: '按选课人数' },
  { value: '1', label: '按创建时间' }
]

// 审核状态映射
const reviewStatusMap = {
  'APPROVED': '已通过',
  'PENDING': '待审核',
  'REJECTED': '已拒绝'
}

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
    const params = {
      name: searchForm.value.courseName,
      subjectId: searchForm.value.courseSubject,
      typeId: searchForm.value.courseType,
      startSelectCount: searchForm.value.startSelectCount,
      endSelectCount: searchForm.value.endSelectCount,
      startCreateTime: searchForm.value.startCreateTime || '2025-01-01T00:00:00',
      endCreateTime: searchForm.value.endCreateTime || '2027-01-01T12:00:00',
      sortType: searchForm.value.sortType || '0',
      isAsc: searchForm.value.ascending?.toString() || 'true',
      pageNum: page.value.toString(),
      pageSize: pageSize.value.toString()
    }
    const response = await courseApi.getCoursePage(params)
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

const handleReset = () => {
  searchForm.value = {
    courseName: '',
    courseSubject: '',
    courseType: '',
    startSelectCount: '',
    endSelectCount: '',
    startCreateTime: '2025-01-01T00:00:00',
    endCreateTime: '2027-01-01T12:00:00',
    sortType: '0',
    ascending: true
  }
  page.value = 1
  getCourses()
}

const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
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
      <el-form :model="searchForm" inline>
        <!-- 基础搜索条件 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="课程名称" style="width: 100%;">
              <el-input
                v-model="searchForm.courseName"
                placeholder="请输入课程名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="课程科目" style="width: 100%;">
              <el-select
                v-model="searchForm.courseSubject"
                placeholder="请选择课程科目"
                clearable
                style="width: 100%;"
              >
                <el-option
                  v-for="option in courseSubjectOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="课程类型" style="width: 100%;">
              <el-select
                v-model="searchForm.courseType"
                placeholder="请选择课程类型"
                clearable
                style="width: 100%;"
              >
                <el-option
                  v-for="option in courseTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 高级搜索条件 -->
        <el-row :gutter="20" v-if="showAdvancedSearch">
          <el-col :span="8">
            <el-form-item label="选课人数" style="width: 100%;">
              <el-input-number
                v-model="searchForm.startSelectCount"
                placeholder="起始"
                :min="0"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-input-number
                v-model="searchForm.endSelectCount"
                placeholder="结束"
                :min="0"
                style="width: 48%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建时间" style="width: 100%;">
              <el-date-picker
                v-model="searchForm.startCreateTime"
                type="datetime"
                placeholder="起始时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-date-picker
                v-model="searchForm.endCreateTime"
                type="datetime"
                placeholder="结束时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 48%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序方式" style="width: 100%;">
              <el-select
                v-model="searchForm.sortType"
                style="width: 60%;"
              >
                <el-option
                  v-for="option in sortTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <el-switch
                v-model="searchForm.ascending"
                active-text="升序"
                inactive-text="降序"
                style="margin-left: 10px;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 按钮行（所有搜索条件的下一行） -->
        <el-row :gutter="20" style="margin-top: 15px;">
          <el-col :span="24" style="display: flex; justify-content: flex-end;">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset" style="margin-left: 10px;">重置</el-button>
            <el-button type="info" @click="toggleAdvancedSearch" style="margin-left: 10px;">
              {{ showAdvancedSearch ? '收起高级搜索' : '高级搜索' }}
            </el-button>
          </el-col>
        </el-row>
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
      <el-table-column prop="id" label="课程ID" width="100" />
      <el-table-column prop="name" label="课程名称" min-width="300" />
      <el-table-column prop="subjectId" label="课程科目" width="120">
        <template #default="scope">
          {{ courseSubjectOptions.find(opt => opt.value === scope.row.subjectId?.toString())?.label || scope.row.subjectId }}
        </template>
      </el-table-column>
      <el-table-column prop="typeId" label="课程类型" width="120">
        <template #default="scope">
          {{ courseTypeOptions.find(opt => opt.value === scope.row.typeId?.toString())?.label || scope.row.typeId }}
        </template>
      </el-table-column>
      <el-table-column prop="profile" label="课程简介" min-width="200" />
      <el-table-column prop="reviewStatus" label="审核状态" width="120">
        <template #default="scope">
          {{ reviewStatusMap[scope.row.reviewStatus] || scope.row.reviewStatus }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleCourseDetail(scope.row.id)" style="margin-right: 5px">查看</el-button>
          <el-button size="small" type="primary" @click="handleSelectCourse(scope.row.id)">选课</el-button>
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

:deep(.el-form-item__label) {
  font-weight: bold;
}
</style>
