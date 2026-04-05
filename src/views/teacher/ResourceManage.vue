<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElDialog, ElInputNumber, ElDatePicker, ElSwitch, ElSelect, ElOption } from 'element-plus'
import { getCourseResourcePage, deleteCourseResource } from '../../api/courseResource'
import { getCreateCoursePage } from '../../api/course'
import ResourceCreate from './ResourceCreate.vue'

const router = useRouter()

const resources = ref([])
const courses = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const createDialogVisible = ref(false)

const searchForm = ref({
  courseId: '',
  resourceName: '',
  resourceType: '',
  startViewCount: null,
  endViewCount: null,
  startCreateTime: '',
  endCreateTime: '',
  sortType: 0,
  ascending: true
})

const showAdvancedSearch = ref(false)

const resourceTypeOptions = [
  { value: 'VIDEO', label: '视频' },
  { value: 'MATERIAL', label: '课件' },
  { value: 'REFERENCE', label: '参考资料' }
]

const sortTypeOptions = [
  { value: 0, label: '按排序id' },
  { value: 1, label: '按查看次数' },
  { value: 2, label: '按创建时间' }
]

const loadCourses = async () => {
  try {
    const response = await getCreateCoursePage({ pageNum: 1, pageSize: 100 })
    courses.value = response.data.data.records
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + (error.message || '未知错误'))
  }
}

const loadResources = async () => {
  loading.value = true
  try {
    const response = await getCourseResourcePage({
      courseId: searchForm.value.courseId,
      name: searchForm.value.resourceName,
      resourceType: searchForm.value.resourceType,
      startViewCount: searchForm.value.startViewCount || "0",
      endViewCount: searchForm.value.endViewCount || "7",
      startCreateTime: searchForm.value.startCreateTime || "2025-01-01T12:00:00",
      endCreateTime: searchForm.value.endCreateTime || "2027-01-01T12:00:00",
      sortType: searchForm.value.sortType || "1",
      isAsc: searchForm.value.ascending?.toString() || "true",
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    resources.value = response.data.data.records
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取教学资源失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadResources()
}

const handleReset = () => {
  searchForm.value = {
    courseId: '',
    resourceName: '',
    resourceType: '',
    startViewCount: null,
    endViewCount: null,
    startCreateTime: '',
    endCreateTime: '',
    sortType: 0,
    ascending: true
  }
  currentPage.value = 1
  loadResources()
}

const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
  if (!showAdvancedSearch.value) {
    searchForm.value = {
      courseId: '',
      resourceName: '',
      resourceType: '',
      startViewCount: null,
      endViewCount: null,
      startCreateTime: '',
      endCreateTime: '',
      sortType: 0,
      ascending: true
    }
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadResources()
}

const handleCreateResource = () => {
  createDialogVisible.value = true
}

const handleResourceDetail = (resourceId) => {
  router.push(`/teacher/resource/${resourceId}`)
}

const handleDelete = async (resourceId) => {
  if (confirm('确定要删除这个教学资源吗？')) {
    loading.value = true
    try {
      await deleteCourseResource(resourceId)
      ElMessage.success('教学资源删除成功')
      loadResources()
    } catch (error) {
      ElMessage.error('教学资源删除失败：' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }
}

const handleResourceCreated = () => {
  createDialogVisible.value = false
  loadResources()
}

onMounted(() => {
  loadCourses()
  loadResources()
})
</script>

<template>
  <div class="resource-manage-container">
    <div class="header">
      <h2>教学资源管理</h2>
      <el-button type="primary" @click="handleCreateResource">创建资源</el-button>
    </div>
    
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <!-- 基础搜索条件 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="课程" style="width: 100%;">
              <el-select
                v-model="searchForm.courseId"
                placeholder="请选择课程"
                style="width: 100%;"
              >
                <el-option
                  v-for="course in courses"
                  :key="course.id"
                  :label="course.courseName"
                  :value="course.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资源名称" style="width: 100%;">
              <el-input
                v-model="searchForm.resourceName"
                placeholder="请输入资源名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资源类型" style="width: 100%;">
              <el-select
                v-model="searchForm.resourceType"
                placeholder="请选择资源类型"
                clearable
                style="width: 100%;"
              >
                <el-option
                  v-for="option in resourceTypeOptions"
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
            <el-form-item label="查看次数" style="width: 100%;">
              <el-input-number
                v-model="searchForm.startViewCount"
                placeholder="起始"
                :min="0"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-input-number
                v-model="searchForm.endViewCount"
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
      :data="resources" 
      style="width: 100%" 
      :loading="loading"
      empty-text=""
      :cell-style="{ textAlign: 'center' }"
      :header-cell-style="{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f7fa' }"
    >
      <el-table-column prop="sortId" label="排序ID" width="80" />
      <el-table-column prop="resourceName" label="资源名称" min-width="300" />
      <el-table-column prop="resourceType" label="资源类型" width="120">
        <template #default="scope">
          {{ scope.row.resourceType === 'VIDEO' ? '视频' : scope.row.resourceType === 'MATERIAL' ? '课件' : '参考资料' }}
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="查看次数" width="140" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleResourceDetail(scope.row.id)" style="margin-right: 5px">查看详情</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="empty-state">
          <el-icon class="empty-icon"><i class="el-icon-info"></i></el-icon>
          <p>暂无资源数据</p>
          <p style="font-size: 14px; color: #909399; margin-top: 8px;">请选择课程后查看教学资源</p>
        </div>
      </template>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="loadResources"
      @current-change="handlePageChange"
    />
    
    <!-- 创建资源对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建教学资源"
      width="900px"
      destroy-on-close
    >
      <ResourceCreate @resource-created="handleResourceCreated" @cancel="createDialogVisible = false" />
    </el-dialog>
  </div>
</template>

<style scoped>
.resource-manage-container {
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