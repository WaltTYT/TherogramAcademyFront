<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElDialog, ElInputNumber, ElDatePicker, ElSwitch, ElSelect, ElOption, ElMessageBox } from 'element-plus'
import { getHomeworkPage, deleteHomework, modifyHomework } from '../../api/homework'
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

// 编辑对话框
const editDialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 作业表单
const homeworkForm = ref({
  id: '',
  name: '',
  type: '',
  deadline: '',
  content: '',
  courseId: ''
})

const homeworkFormRules = {
  name: [
    { required: true, message: '请输入作业名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择作业类型', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入作业内容', trigger: 'blur' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ]
}

const homeworkFormRef = ref(null)

const searchForm = ref({
  courseId: '',
  homeworkName: '',
  homeworkType: '',
  startScore: '',
  endScore: '',
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

const sortTypeOptions = [
  { value: 0, label: '按截至时间' },
  { value: 1, label: '按创建时间' },
  { value: 2, label: '按分数' },
  { value: 3, label: '按提交时间' }
]

const loadCourses = async () => {
  try {
    const response = await getCreateCoursePage({
      name: "",
      subjectId: "",
      typeId: "",
      startSelectCount: "",
      endSelectCount: "",
      startCreateTime: "",
      endCreateTime: "",
      sortType: "1",
      isAsc: "true",
      pageNum: 1,
      pageSize: 10
    })
    courses.value = response.data.data.records
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + (error.message || '未知错误'))
  }
}

const loadHomeworks = async () => {
  loading.value = true
  try {
    const response = await getHomeworkPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      courseId: searchForm.value.courseId ? parseInt(searchForm.value.courseId) : null,
      name: searchForm.value.homeworkName,
      type: searchForm.value.homeworkType,
      startScore: searchForm.value.startScore,
      endScore: searchForm.value.endScore,
      startDeadline: searchForm.value.startDeadline,
      endDeadline: searchForm.value.endDeadline,
      startCreateTime: searchForm.value.startCreateTime,
      endCreateTime: searchForm.value.endCreateTime,
      startSubmitTime: searchForm.value.startSubmitTime,
      endSubmitTime: searchForm.value.endSubmitTime,
      startSubmitCount: '',
      endSubmitCount: '',
      sortType: 0,
      isAsc: true,
      isDeleted: false
    })
    homeworks.value = response.data.data.records
    total.value = response.data.data.total
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

const handleReset = () => {
  searchForm.value = {
    courseId: '',
    homeworkName: '',
    homeworkType: '',
    startScore: '',
    endScore: '',
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
      courseId: '',
      homeworkName: '',
      homeworkType: '',
      startScore: '',
      endScore: '',
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

const handleCreateHomework = () => {
  createDialogVisible.value = true
}

const handleHomeworkDetail = (homeworkId) => {
  router.push(`/teacher/homework/${homeworkId}`)
}

// 打开编辑对话框
const handleEdit = (homework) => {
  dialogTitle.value = '编辑作业'
  isEdit.value = true
  // 填充表单
  homeworkForm.value.id = homework.id
  homeworkForm.value.name = homework.name || homework.homeworkName
  homeworkForm.value.type = homework.type || homework.homeworkType
  homeworkForm.value.deadline = homework.deadline
  homeworkForm.value.content = homework.content
  homeworkForm.value.courseId = homework.courseId
  editDialogVisible.value = true
}

// 保存作业
const saveHomework = async () => {
  await homeworkFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await modifyHomework(homeworkForm.value)
        if (response.data.code === 200) {
          ElMessage.success('修改作业成功')
          editDialogVisible.value = false
          loadHomeworks()
        } else {
          ElMessage.error(response.data.message || '修改作业失败')
        }
      } catch (error) {
        ElMessage.error('修改作业失败')
      }
    }
  })
}

// 下载作业
const handleDownload = (homework) => {
  if (!homework.attachment) {
    ElMessage.error('作业附件不存在')
    return
  }
  
  // 构建下载链接
  window.location.href = `http://localhost:8085/api/homework/downloadHomework${homework.attachment}`
}

// 批改对话框
const correctDialogVisible = ref(false)
const currentHomework = ref(null)
const studentSubmissions = ref([])
const currentSubmission = ref(null)
const correctForm = ref({
  score: '',
  comment: ''
})

// 打开批改对话框
const handleCorrect = (homework) => {
  currentHomework.value = homework
  loadStudentSubmissions(homework.id)
  correctDialogVisible.value = true
}

// 加载学生提交的作业
const loadStudentSubmissions = async (homeworkId) => {
  try {
    // 这里需要调用后端API获取学生提交的作业列表
    // 暂时使用模拟数据
    studentSubmissions.value = [
      {
        id: 1,
        studentId: 11,
        studentName: '张三',
        content: '这是我的作业内容',
        attachment: '/attachments/homework/1_1.pdf',
        submitTime: '2025-03-15 14:30:00',
        score: null,
        comment: null
      },
      {
        id: 2,
        studentId: 12,
        studentName: '李四',
        content: '作业已完成',
        attachment: null,
        submitTime: '2025-03-16 09:15:00',
        score: null,
        comment: null
      }
    ]
  } catch (error) {
    ElMessage.error('获取学生提交的作业失败：' + (error.message || '未知错误'))
  }
}

// 选择学生作业进行批改
const selectSubmission = (submission) => {
  currentSubmission.value = submission
  correctForm.value = {
    score: submission.score || '',
    comment: submission.comment || ''
  }
}

// 下载学生提交的作业
const downloadStudentSubmission = (submission) => {
  if (!submission.attachment) {
    ElMessage.error('学生未提交附件')
    return
  }
  
  // 构建下载链接
  window.location.href = `http://localhost:8085/api/homework/downloadStudentHomework${submission.attachment}`
}

// 保存批改结果
const saveCorrection = async () => {
  if (!currentSubmission.value) {
    ElMessage.error('请选择要批改的作业')
    return
  }
  
  try {
    // 这里需要调用后端API保存批改结果
    console.log('保存批改结果：', {
      submissionId: currentSubmission.value.id,
      score: correctForm.value.score,
      comment: correctForm.value.comment
    })
    
    ElMessage.success('批改成功')
    // 更新本地数据
    const index = studentSubmissions.value.findIndex(item => item.id === currentSubmission.value.id)
    if (index !== -1) {
      studentSubmissions.value[index].score = correctForm.value.score
      studentSubmissions.value[index].comment = correctForm.value.comment
    }
  } catch (error) {
    ElMessage.error('批改失败：' + (error.message || '未知错误'))
  }
}

// 上传批改后的附件
const uploadCorrectedFile = (file) => {
  // 这里需要实现文件上传功能
  console.log('上传批改后的文件：', file)
  ElMessage.success('文件上传成功')
}

const handleDelete = async (homework) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除作业「${homework.name || homework.homeworkName}」吗？\n删除后将无法恢复，且相关的学生作业数据也会被删除。`,
      '删除作业',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )
    
    loading.value = true
    await deleteHomework(homework.id)
    ElMessage.success('作业删除成功')
    loadHomeworks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('作业删除失败：' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
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
                  v-for="option in homeworkTypeOptions"
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
      <el-table-column prop="name" label="作业名称" min-width="300" />
      <el-table-column prop="type" label="作业类型" width="120">
        <template #default="scope">
          {{ scope.row.type === 'HOMEWORK' ? '作业' : '考试' }}
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止时间" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="submitCount" label="提交人数" width="100" />
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button size="small" @click="handleHomeworkDetail(scope.row.id)" style="margin-right: 5px">查看</el-button>
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" style="margin-right: 5px">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" style="margin-right: 5px">删除</el-button>
          <el-button size="small" @click="handleCorrect(scope.row)">批改</el-button>
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
      width="900px"
      destroy-on-close
    >
      <HomeworkCreate @homework-created="handleHomeworkCreated" @cancel="createDialogVisible = false" />
    </el-dialog>
    
    <!-- 编辑作业对话框 -->
    <el-dialog v-model="editDialogVisible" :title="dialogTitle" width="900px">
      <el-form ref="homeworkFormRef" :model="homeworkForm" :rules="homeworkFormRules" label-width="120px">
        <el-form-item label="作业名称" prop="name">
          <el-input v-model="homeworkForm.name" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="作业类型" prop="type">
          <el-select v-model="homeworkForm.type" style="width: 100%">
            <el-option v-for="option in homeworkTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker v-model="homeworkForm.deadline" type="datetime" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="作业内容" prop="content">
          <el-input v-model="homeworkForm.content" type="textarea" rows="4" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="homeworkForm.courseId" style="width: 100%">
              <el-option v-for="course in courses" :key="course.id" :label="course.name" :value="course.id" />
            </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveHomework">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批改作业对话框 -->
    <el-dialog v-model="correctDialogVisible" :title="`批改作业 - ${currentHomework?.name || ''}`" width="1000px">
      <div class="correct-container">
        <!-- 学生提交列表 -->
        <div class="submission-list">
          <h3>学生提交列表</h3>
          <el-table :data="studentSubmissions" style="width: 100%" @row-click="selectSubmission">
            <el-table-column prop="studentName" label="学生姓名" width="120" />
            <el-table-column prop="content" label="提交内容" min-width="200" />
            <el-table-column prop="submitTime" label="提交时间" width="180" />
            <el-table-column prop="score" label="分数" width="80" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="downloadStudentSubmission(scope.row)" style="margin-right: 5px">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 批改区域 -->
        <div class="correction-area" v-if="currentSubmission">
          <h3>批改 - {{ currentSubmission.studentName }}</h3>
          <el-form :model="correctForm" label-width="80px">
            <el-form-item label="分数">
              <el-input v-model="correctForm.score" placeholder="请输入分数" style="width: 120px" />
            </el-form-item>
            <el-form-item label="评语">
              <el-input v-model="correctForm.comment" type="textarea" rows="4" style="width: 100%" />
            </el-form-item>
            <el-form-item label="上传批改附件">
              <el-upload
                class="upload-demo"
                action="http://localhost:8085/api/homework/uploadStudentHomework"
                :on-success="uploadCorrectedFile"
                :auto-upload="false"
                :file-list="[]"
              >
                <el-button type="primary">点击上传</el-button>
                <template #tip>
                  <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </template>
              </el-upload>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="saveCorrection" style="margin-top: 20px">保存批改</el-button>
        </div>
        <div v-else class="no-selection">
          <p>请选择一个学生作业进行批改</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="correctDialogVisible = false">关闭</el-button>
        </span>
      </template>
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

/* 编辑对话框样式 */
.dialog-footer {
  text-align: right;
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

/* 批改对话框样式 */
.correct-container {
  padding: 20px 0;
}

.submission-list {
  margin-bottom: 30px;
}

.submission-list h3,
.correction-area h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.correction-area {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.no-selection {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

:deep(.el-upload) {
  margin-top: 10px;
}

:deep(.el-upload__tip) {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

</style>