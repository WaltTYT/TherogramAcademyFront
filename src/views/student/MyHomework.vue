<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElInputNumber, ElDatePicker, ElSwitch, ElSelect, ElOption } from 'element-plus'
import { getStudentHomeworkPage, remindHomework } from '../../api/homework'

const router = useRouter()

const homeworks = ref([])
const reminders = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = ref({
  homeworkName: '',
  homeworkType: '',
  status: '',
  startScore: null,
  endScore: null,
  startDeadline: '',
  endDeadline: '',
  startCreateTime: '',
  endCreateTime: '',
  startSubmitTime: '',
  endSubmitTime: '',
  sortType: 0,
  ascending: true
})

const showAdvancedSearch = ref(false)

const homeworkTypeOptions = [
  { value: 'HOMEWORK', label: '作业' },
  { value: 'EXAM', label: '考试' }
]

const statusOptions = [
  { value: 'UNSUBMITTED', label: '未提交' },
  { value: 'PENDING', label: '未评定' },
  { value: 'APPROVED', label: '评定通过' },
  { value: 'REJECTED', label: '评定未通过' }
]

const sortTypeOptions = [
  { value: 0, label: '按截至时间' },
  { value: 1, label: '按创建时间' },
  { value: 2, label: '按分数' },
  { value: 3, label: '按提交时间' }
]

const loadHomeworks = async () => {
  loading.value = true
  try {
    const response = await getStudentHomeworkPage({
      page: currentPage.value,
      size: pageSize.value,
      homeworkName: searchForm.value.homeworkName,
      homeworkType: searchForm.value.homeworkType,
      status: searchForm.value.status,
      startScore: searchForm.value.startScore,
      endScore: searchForm.value.endScore,
      startDeadline: searchForm.value.startDeadline,
      endDeadline: searchForm.value.endDeadline,
      startCreateTime: searchForm.value.startCreateTime,
      endCreateTime: searchForm.value.endCreateTime,
      startSubmitTime: searchForm.value.startSubmitTime,
      endSubmitTime: searchForm.value.endSubmitTime,
      sortType: searchForm.value.sortType,
      ascending: searchForm.value.ascending
    })
    homeworks.value = response.data.data.records
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取作业列表失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const loadReminders = async () => {
  try {
    const response = await remindHomework()
    reminders.value = response.data
  } catch (error) {
    ElMessage.error('获取作业提醒失败：' + (error.message || '未知错误'))
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadHomeworks()
}

const handleReset = () => {
  searchForm.value = {
    homeworkName: '',
    homeworkType: '',
    status: '',
    startScore: null,
    endScore: null,
    startDeadline: '',
    endDeadline: '',
    startCreateTime: '',
    endCreateTime: '',
    startSubmitTime: '',
    endSubmitTime: '',
    sortType: 0,
    ascending: true
  }
  currentPage.value = 1
  loadHomeworks()
}

const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
  if (!showAdvancedSearch.value) {
    searchForm.value = {
      homeworkName: '',
      homeworkType: '',
      status: '',
      startScore: null,
      endScore: null,
      startDeadline: '',
      endDeadline: '',
      startCreateTime: '',
      endCreateTime: '',
      startSubmitTime: '',
      endSubmitTime: '',
      sortType: 0,
      ascending: true
    }
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadHomeworks()
}

const handleHomeworkDetail = (homeworkId) => {
  router.push(`/student/homework-detail/${homeworkId}`)
}

onMounted(() => {
  loadHomeworks()
  loadReminders()
})
</script>

<template>
  <div class="my-homework-container">
    <h2>我的作业</h2>
    
    <!-- 作业提醒 -->
    <el-card v-if="reminders.length > 0" class="reminder-card">
      <h3>作业提醒</h3>
      <el-alert
        v-for="(reminder, index) in reminders"
        :key="index"
        :title="reminder.homeworkName"
        :type="'warning'"
        :closable="false"
      >
        <div class="reminder-content">
          <span>截止时间：{{ reminder.deadline }}</span>
          <el-button type="primary" size="small" @click="handleHomeworkDetail(reminder.id)">查看详情</el-button>
        </div>
      </el-alert>
    </el-card>
    
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <!-- 基础搜索条件 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="作业名称" style="width: 100%;">
              <el-input
                v-model="searchForm.homeworkName"
                placeholder="请输入作业名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="作业类型" style="width: 100%;">
              <el-select
                v-model="searchForm.homeworkType"
                placeholder="请选择作业类型"
                clearable
                style="width: 100%;"
              >
                <el-option
                  v-for="option in homeworkTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="提交状态" style="width: 100%;">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择提交状态"
                clearable
                style="width: 100%;"
              >
                <el-option
                  v-for="option in statusOptions"
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
            <el-form-item label="分数范围" style="width: 100%;">
              <el-input-number
                v-model="searchForm.startScore"
                placeholder="起始"
                :min="0"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-input-number
                v-model="searchForm.endScore"
                placeholder="结束"
                :min="0"
                style="width: 48%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="截止时间" style="width: 100%;">
              <el-date-picker
                v-model="searchForm.startDeadline"
                type="datetime"
                placeholder="起始时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-date-picker
                v-model="searchForm.endDeadline"
                type="datetime"
                placeholder="结束时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
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
        </el-row>
        
        <el-row :gutter="20" v-if="showAdvancedSearch">
          <el-col :span="8">
            <el-form-item label="提交时间" style="width: 100%;">
              <el-date-picker
                v-model="searchForm.startSubmitTime"
                type="datetime"
                placeholder="起始时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-date-picker
                v-model="searchForm.endSubmitTime"
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
      <el-table-column prop="submitTime" label="提交时间" width="180" />
      <el-table-column prop="score" label="成绩" width="80" />
      <el-table-column prop="status" label="提交状态" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 'UNSUBMITTED'" type="warning">未提交</el-tag>
          <el-tag v-else-if="scope.row.status === 'PENDING'" type="info">未评定</el-tag>
          <el-tag v-else-if="scope.row.status === 'APPROVED'" type="success">评定通过</el-tag>
          <el-tag v-else type="danger">评定未通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleHomeworkDetail(scope.row.id)">查看详情</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="empty-state">
          <el-icon class="empty-icon"><i class="el-icon-info"></i></el-icon>
          <p>暂无作业数据</p>
          <p style="font-size: 14px; color: #909399; margin-top: 8px;">您还没有任何作业</p>
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
  </div>
</template>

<style scoped>
.my-homework-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.my-homework-container h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.reminder-card {
  margin-bottom: 30px;
}

.reminder-card h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.reminder-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
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

:deep(.el-button:hover) {
  opacity: 0.8;
}

</style>