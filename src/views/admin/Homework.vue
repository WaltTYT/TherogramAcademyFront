<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElPagination, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDatePicker, ElUpload } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as homeworkApi from '../../api/homework'
import * as courseApi from '../../api/course'

const router = useRouter()
const userStore = useUserStore()

// 课程列表
const courses = ref([])
const selectedCourseId = ref('')

// 作业列表
const homeworks = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索条件
const searchForm = reactive({
  homeworkName: '',
  homeworkType: '',
  isFilterDeleted: false,
  startSubmitCount: '',
  endSubmitCount: '',
  startDeadline: '',
  endDeadline: '',
  startCreateTime: '',
  endCreateTime: '',
  sortType: '0',
  isAsc: true
})

const showAdvancedSearch = ref(false)

// 作业类型选项
const homeworkTypes = [
  { value: 'HOMEWORK', label: '作业' },
  { value: 'EXAM', label: '考试' }
]

// 排序方式选项
const sortTypes = [
  { value: '0', label: '按提交人数' },
  { value: '1', label: '按截至时间' },
  { value: '2', label: '按创建时间' }
]

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 作业表单
const homeworkForm = reactive({
  id: '',
  homeworkName: '',
  homeworkType: '',
  deadline: '',
  homeworkContent: '',
  courseId: ''
})

const homeworkFormRules = {
  homeworkName: [
    { required: true, message: '请输入作业名称', trigger: 'blur' }
  ],
  homeworkType: [
    { required: true, message: '请选择作业类型', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择截至时间', trigger: 'change' }
  ],
  homeworkContent: [
    { required: true, message: '请输入作业内容', trigger: 'blur' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ]
}

const homeworkFormRef = ref(null)

// 上传文件
const uploadUrl = '/api/homework/uploadHomework'
const fileList = ref([])

// 处理文件变化
const handleFileChange = (file, files) => {
  fileList.value = files
}

const handleHomeworkRemove = (file, fileList) => {
  // 移除文件时的处理
}

// 获取课程列表
const getCourses = async () => {
  try {
    let response
    if (userStore.roleType === 'STUDENT') {
      // 学生获取选修的课程
      response = await courseApi.getSelectCoursePage({
        pageNum: 1,
        pageSize: 100
      })
    } else {
      // 教师和管理员获取所有课程
      response = await courseApi.getCoursePage({
        pageNum: 1,
        pageSize: 100
      })
    }
    if (response.data.code === 200) {
      courses.value = response.data.data.records
    } else {
      ElMessage.error(response.data.message || '获取课程列表失败')
    }
  } catch (error) {
    ElMessage.error('获取课程列表失败')
  }
}

// 获取作业列表
const getHomeworks = async () => {
  if (!selectedCourseId.value) {
    homeworks.value = []
    total.value = 0
    return
  }
  
  loading.value = true
  try {
    const response = await homeworkApi.getHomeworkPage({
      courseId: selectedCourseId.value,
      name: searchForm.homeworkName,
      type: searchForm.homeworkType || "HOMEWORK",
      isDeleted: "false",
      startSubmitCount: searchForm.startSubmitCount,
      endSubmitCount: searchForm.endSubmitCount,
      startDeadline: searchForm.startDeadline,
      endDeadline: searchForm.endDeadline,
      startCreateTime: searchForm.startCreateTime,
      endCreateTime: searchForm.endCreateTime,
      sortType: searchForm.sortType || "0",
      isAsc: searchForm.isAsc?.toString() || "true",
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if (response.data.code === 200) {
      // 过滤掉已删除的作业
      const records = response.data.data.records || []
      homeworks.value = records.filter(homework => !homework.isDeleted)
      total.value = homeworks.value.length
    } else {
      ElMessage.error(response.data.message || '获取作业列表失败')
    }
  } catch (error) {
    ElMessage.error('获取作业列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索作业
const handleSearch = () => {
  currentPage.value = 1
  getHomeworks()
}

// 重置搜索
const handleReset = () => {
  searchForm.homeworkName = ''
  searchForm.homeworkType = ''
  searchForm.isFilterDeleted = false
  searchForm.startSubmitCount = ''
  searchForm.endSubmitCount = ''
  searchForm.startDeadline = ''
  searchForm.endDeadline = ''
  searchForm.startCreateTime = ''
  searchForm.endCreateTime = ''
  searchForm.sortType = '0'
  searchForm.isAsc = true
  currentPage.value = 1
  getHomeworks()
}

// 切换高级搜索
const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
  if (!showAdvancedSearch.value) {
    searchForm.homeworkName = ''
    searchForm.homeworkType = ''
    searchForm.isFilterDeleted = false
    searchForm.startSubmitCount = ''
    searchForm.endSubmitCount = ''
    searchForm.startDeadline = ''
    searchForm.endDeadline = ''
    searchForm.startCreateTime = ''
    searchForm.endCreateTime = ''
    searchForm.sortType = '0'
    searchForm.isAsc = true
  }
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  getHomeworks()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getHomeworks()
}

// 打开创建作业对话框
const openCreateDialog = () => {
  dialogTitle.value = '创建作业'
  isEdit.value = false
  // 重置表单
  homeworkForm.id = ''
  homeworkForm.homeworkName = ''
  homeworkForm.homeworkType = ''
  homeworkForm.deadline = ''
  homeworkForm.homeworkContent = ''
  homeworkForm.courseId = ''
  fileList.value = []
  dialogVisible.value = true
}

// 打开编辑作业对话框
const openEditDialog = (homework) => {
  dialogTitle.value = '修改作业'
  isEdit.value = true
  // 填充表单
  homeworkForm.id = homework.id
  homeworkForm.homeworkName = homework.name || homework.homeworkName
  homeworkForm.homeworkType = homework.type || homework.homeworkType
  homeworkForm.deadline = homework.deadline
  homeworkForm.homeworkContent = homework.content || homework.homeworkContent
  homeworkForm.courseId = homework.courseId
  fileList.value = homework.attachment || homework.homeworkUrl ? [{ url: homework.attachment || homework.homeworkUrl }] : []
  dialogVisible.value = true
}

// 保存作业
const saveHomework = async () => {
  await homeworkFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response
        let homeworkId
        // 映射字段名到正确的格式
        const homeworkData = {
          name: homeworkForm.homeworkName,
          type: homeworkForm.homeworkType,
          deadline: homeworkForm.deadline,
          content: homeworkForm.homeworkContent,
          courseId: homeworkForm.courseId
        }
        // 编辑时需要包含id
        if (isEdit.value) {
          homeworkData.id = homeworkForm.id
          response = await homeworkApi.modifyHomework(homeworkData)
          homeworkId = homeworkForm.id
        } else {
          response = await homeworkApi.createHomework(homeworkData)
          homeworkId = response.data.data
        }
        if (response.data.code === 200) {
          // 如果有文件，上传附件
          if (fileList.value.length > 0 && fileList.value[0].raw) {
            await homeworkApi.uploadHomework(homeworkId, fileList.value[0].raw)
            ElMessage.success(isEdit.value ? '修改作业和上传文件成功' : '创建作业和上传文件成功')
          } else {
            ElMessage.success(isEdit.value ? '修改作业成功' : '创建作业成功')
          }
          dialogVisible.value = false
          getHomeworks()
        } else {
          ElMessage.error(response.data.message || (isEdit.value ? '修改作业失败' : '创建作业失败'))
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? '修改作业失败' : '创建作业失败')
      }
    }
  })
}

// 删除作业
const deleteHomework = (homework) => {
  ElMessageBox.confirm(`确定要删除作业「${homework.name || homework.homeworkName}」吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await homeworkApi.deleteHomework(homework.id)
      if (response.data.code === 200) {
        ElMessage.success('删除作业成功')
        getHomeworks()
      } else {
        ElMessage.error(response.data.message || '删除作业失败')
      }
    } catch (error) {
      ElMessage.error('删除作业失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 查看作业详情
const viewHomeworkDetail = (homework) => {
  // 跳转到作业详情页面
  router.push(`/admin/homework/detail/${homework.id}`)
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 获取课程列表
  getCourses()
})
</script>

<template>
  <div class="homework-management">
    <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>作业管理</h2>
      <el-button type="primary" @click="openCreateDialog">创建作业</el-button>
    </div>
    
    <div class="search-form">
      <el-form :model="{ courseId: selectedCourseId, ...searchForm }" inline>
        <!-- 基础搜索条件 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="选择课程" style="width: 100%;">
              <el-select
                v-model="selectedCourseId"
                placeholder="请选择课程"
                @change="getHomeworks"
                style="width: 100%;"
              >
                <el-option
                  v-for="course in courses"
                  :key="course.id"
                  :label="course.name"
                  :value="course.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
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
                  v-for="type in homeworkTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 高级搜索条件 -->
        <el-row :gutter="20" v-if="showAdvancedSearch">
          <el-col :span="8">
            <el-form-item label="提交人数" style="width: 100%;">
              <el-input-number
                v-model="searchForm.startSubmitCount"
                placeholder="起始"
                :min="0"
                style="width: 48%;"
              />
              <span style="margin: 0 4%;">-</span>
              <el-input-number
                v-model="searchForm.endSubmitCount"
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
            <el-form-item v-if="userStore.roleType !== 'STUDENT'" style="width: 100%;">
              <el-checkbox v-model="searchForm.isFilterDeleted">过滤已删除作业</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序方式" style="width: 100%;">
              <el-select
                v-model="searchForm.sortType"
                style="width: 60%;"
              >
                <el-option
                  v-for="type in sortTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
              <el-switch
                v-model="searchForm.isAsc"
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
    
    <div class="homework-list">
      <el-table 
        :data="homeworks" 
        :loading="loading" 
        style="width: 100%" 
        empty-text=""
        :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f7fa' }"
      >
        <el-table-column label="作业名称" min-width="300">
          <template #default="{ row }">
            {{ row.name || row.homeworkName }}
          </template>
        </el-table-column>
        <el-table-column label="作业类型" width="120">
          <template #default="{ row }">
            {{ homeworkTypes.find(t => t.value == (row.type || row.homeworkType))?.label || (row.type || row.homeworkType) }}
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截至时间" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="submitCount" label="提交人数" width="100" />
        <el-table-column label="操作" width="320">
          <template #default="{ row }">
            <el-button size="small" @click="viewHomeworkDetail(row)" style="margin-right: 5px">查看</el-button>
            <el-button size="small" type="primary" @click="openEditDialog(row)" style="margin-right: 5px">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteHomework(row)">删除</el-button>
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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 作业编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-form ref="homeworkFormRef" :model="homeworkForm" :rules="homeworkFormRules" label-width="120px">
        <el-form-item label="作业名称" prop="homeworkName">
          <el-input v-model="homeworkForm.homeworkName" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="作业类型" prop="homeworkType">
          <el-select v-model="homeworkForm.homeworkType" style="width: 100%">
            <el-option v-for="type in homeworkTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="截至时间" prop="deadline">
          <el-date-picker
            v-model="homeworkForm.deadline"
            type="datetime"
            placeholder="请选择截至时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="homeworkForm.courseId" style="width: 100%">
            <el-option v-for="course in courses" :key="course.id" :label="course.name" :value="course.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作业内容" prop="homeworkContent">
          <el-input v-model="homeworkForm.homeworkContent" type="textarea" rows="4" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="作业附件">
          <el-upload
            class="upload-demo"
            :action="''"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            :limit="1"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持上传作业附件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveHomework">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.homework-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.search-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.homework-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 表单样式优化 */
:deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

:deep(.el-select) {
  min-width: 300px;
  width: 100%;
}

:deep(.el-input) {
  min-width: 200px;
  width: 100%;
}

:deep(.el-select .el-select__input) {
  padding-left: 10px;
  width: 100%;
}

:deep(.el-select .el-select__caret) {
  right: 10px;
}

:deep(.el-select .el-select__placeholder) {
  padding-left: 10px;
}

:deep(.el-select-dropdown) {
  min-width: 300px;
}

.el-pagination {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
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