<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElPagination, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElUpload, ElInputNumber, ElDatePicker, ElSwitch, ElMessage as ElMessage2 } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as courseApi from '../../api/course'

const router = useRouter()
const userStore = useUserStore()

// 课程列表
const courses = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索条件
const searchForm = reactive({
  courseName: '',
  courseSubject: '',
  courseType: '',
  startSelectCount: null,
  endSelectCount: null,
  startCreateTime: '',
  endCreateTime: '',
  sortType: 0,
  ascending: true
})

const showAdvancedSearch = ref(false)

// 课程类型和科目选项
const courseSubjects = [
  { value: '', label: '全部' },
  { value: 1, label: '语文' },
  { value: 2, label: '数学' },
  { value: 3, label: '英语' },
  { value: 4, label: '物理' },
  { value: 5, label: '历史' },
  { value: 6, label: '生物' },
  { value: 7, label: '化学' },
  { value: 8, label: '政治' },
  { value: 9, label: '地理' },
  { value: 10, label: '美术' },
  { value: 11, label: '音乐' },
  { value: 12, label: '体育' },
  { value: 13, label: '工学' },
  { value: 14, label: '经济学' },
  { value: 15, label: '法学' },
  { value: 16, label: '教育学' },
  { value: 17, label: '文学' },
  { value: 18, label: '历史学' },
  { value: 19, label: '理学' },
  { value: 20, label: '农学' },
  { value: 21, label: '医学' },
  { value: 22, label: '管理学' },
  { value: 23, label: '艺术学' },
  { value: 24, label: '哲学' }
]

const courseTypes = [
  { value: '', label: '全部' },
  { value: 1, label: '小学共享课' },
  { value: 2, label: '中学共享课' },
  { value: 3, label: '大学共享课' },
  { value: 4, label: '研究生共享课' },
  { value: 5, label: '职业教育课' },
  { value: 6, label: '虚拟实验课' },
  { value: 7, label: '社会实践课' }
]

const sortTypeOptions = [
  { value: 0, label: '按选课人数' },
  { value: 1, label: '按创建时间' }
]

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 审核课程对话框
const reviewDialogVisible = ref(false)
const reviewDialogTitle = ref('审核课程')

// 课程表单
const courseForm = reactive({
  id: '',
  courseName: '',
  courseIntroduction: '',
  courseObjective: '',
  courseContent: '',
  courseOutline: '',
  courseSubject: '',
  courseType: '',
  cover: ''
})

const courseFormRules = {
  courseName: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  courseSubject: [
    { required: true, message: '请选择课程科目', trigger: 'change' }
  ],
  courseType: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ]
}

const courseFormRef = ref(null)

// 上传封面
const uploadUrl = '/course/uploadCourse'
const fileList = ref([])
const handleCoverUpload = (response, uploadFile) => {
  if (response.data.code === 200) {
    courseForm.cover = response.data.data
    ElMessage2.success('封面上传成功')
  } else {
    ElMessage2.error('封面上传失败')
  }
}

const handleCoverRemove = (file, fileList) => {
  courseForm.cover = ''
}

// 获取课程列表
const getCourses = async () => {
  console.log('getCourses called with currentPage:', currentPage.value, 'pageSize:', pageSize.value)
  loading.value = true
  try {
    const response = await courseApi.getCoursePage({
      courseName: searchForm.courseName,
      courseSubject: searchForm.courseSubject,
      courseType: searchForm.courseType,
      startSelectCount: searchForm.startSelectCount,
      endSelectCount: searchForm.endSelectCount,
      startCreateTime: searchForm.startCreateTime,
      endCreateTime: searchForm.endCreateTime,
      sortType: searchForm.sortType,
      ascending: searchForm.ascending,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    console.log('getCourses response:', response)
    if (response.data.code === 200) {
      // 映射后端返回的字段名到前端使用的字段名，并过滤掉已删除的课程
      courses.value = response.data.data.records
        .filter(course => !course.isDeleted)
        .map(course => ({
          ...course,
          courseName: course.name || course.courseName,
          courseIntroduction: course.profile || course.courseIntroduction,
          courseObjective: course.target || course.courseObjective,
          courseContent: course.content || course.courseContent,
          courseOutline: course.outline || course.courseOutline,
          courseSubject: course.subjectId || course.courseSubject,
          courseType: course.typeId || course.courseType
        }))
      total.value = response.data.data.total
      console.log('getCourses success: courses.length =', courses.value.length, 'total =', total.value)
    } else {
      ElMessage.error(response.data.message || '获取课程列表失败')
      console.log('getCourses error:', response.data.message)
    }
  } catch (error) {
    ElMessage.error('获取课程列表失败')
    console.log('getCourses catch error:', error)
  } finally {
    loading.value = false
  }
}

// 搜索课程
const handleSearch = () => {
  currentPage.value = 1
  getCourses()
}

// 重置搜索
const handleReset = () => {
  searchForm.courseName = ''
  searchForm.courseSubject = ''
  searchForm.courseType = ''
  searchForm.startSelectCount = null
  searchForm.endSelectCount = null
  searchForm.startCreateTime = ''
  searchForm.endCreateTime = ''
  searchForm.sortType = 0
  searchForm.ascending = true
  currentPage.value = 1
  getCourses()
}

// 切换高级搜索
const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
  if (!showAdvancedSearch.value) {
    searchForm.courseName = ''
    searchForm.courseSubject = ''
    searchForm.courseType = ''
    searchForm.startSelectCount = null
    searchForm.endSelectCount = null
    searchForm.startCreateTime = ''
    searchForm.endCreateTime = ''
    searchForm.sortType = 0
    searchForm.ascending = true
  }
}

// 分页
const handleSizeChange = (size) => {
  console.log('handleSizeChange called with size:', size)
  pageSize.value = size
  console.log('pageSize updated to:', pageSize.value)
  getCourses()
}

const handleCurrentChange = (current) => {
  console.log('handleCurrentChange called with current:', current)
  currentPage.value = current
  console.log('currentPage updated to:', currentPage.value)
  getCourses()
}

// 打开创建课程对话框
const openCreateDialog = () => {
  dialogTitle.value = '创建课程'
  isEdit.value = false
  // 重置表单
  courseForm.id = ''
  courseForm.courseName = ''
  courseForm.courseIntroduction = ''
  courseForm.courseObjective = ''
  courseForm.courseContent = ''
  courseForm.courseOutline = ''
  courseForm.courseSubject = ''
  courseForm.courseType = ''
  courseForm.cover = ''
  fileList.value = []
  dialogVisible.value = true
}

// 打开编辑课程对话框
const openEditDialog = (course) => {
  dialogTitle.value = '修改课程'
  isEdit.value = true
  // 填充表单
  courseForm.id = course.id
  courseForm.courseName = course.courseName
  courseForm.courseIntroduction = course.courseIntroduction
  courseForm.courseObjective = course.courseObjective
  courseForm.courseContent = course.courseContent
  courseForm.courseOutline = course.courseOutline
  courseForm.courseSubject = course.courseSubject
  courseForm.courseType = course.courseType
  courseForm.cover = course.cover
  fileList.value = course.cover ? [{ url: course.cover }] : []
  dialogVisible.value = true
}

// 保存课程
const saveCourse = async () => {
  await courseFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response
        if (isEdit.value) {
          // 映射字段名称为后端API期望的格式
          const modifyCourseData = {
            id: courseForm.id,
            name: courseForm.courseName,
            profile: courseForm.courseIntroduction,
            target: courseForm.courseObjective,
            content: courseForm.courseContent,
            outline: courseForm.courseOutline,
            subjectId: courseForm.courseSubject,
            typeId: courseForm.courseType,
            cover: courseForm.cover
          }
          response = await courseApi.modifyCourse(modifyCourseData)
        } else {
          // 映射字段名称为后端API期望的格式
          const createCourseData = {
            name: courseForm.courseName,
            profile: courseForm.courseIntroduction,
            target: courseForm.courseObjective,
            content: courseForm.courseContent,
            outline: courseForm.courseOutline,
            subjectId: courseForm.courseSubject,
            typeId: courseForm.courseType,
            cover: courseForm.cover
          }
          response = await courseApi.createCourse(createCourseData)
        }
        if (response.data.code === 200) {
          ElMessage.success(isEdit.value ? '修改课程成功' : '创建课程成功')
          dialogVisible.value = false
          getCourses()
        } else {
          ElMessage.error(response.data.message || (isEdit.value ? '修改课程失败' : '创建课程失败'))
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? '修改课程失败' : '创建课程失败')
      }
    }
  })
}

// 删除课程
const deleteCourse = (course) => {
  ElMessageBox.confirm(`确定要删除课程「${course.courseName}」吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await courseApi.deleteCourse(course.id)
      if (response.data.code === 200) {
        ElMessage.success('删除课程成功')
        getCourses()
      } else {
        ElMessage.error(response.data.message || '删除课程失败')
      }
    } catch (error) {
      ElMessage.error('删除课程失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 查看课程详情
const viewCourseDetail = (course) => {
  router.push(`/admin/course/detail/${course.id}`)
}

// 打开审核课程对话框
const openReviewDialog = () => {
  reviewDialogVisible.value = true
}

// 审核课程
const reviewCourse = async (course, status) => {
  try {
    const response = await courseApi.reviewCourse({ id: course.id, status })
    if (response.data.code === 200) {
      ElMessage.success('审核成功')
      getCourses()
    } else {
      ElMessage.error(response.data.message || '审核失败')
    }
  } catch (error) {
    ElMessage.error('审核失败')
  }
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
  <div class="course-management">
    <div class="header">
      <h2>课程管理</h2>
      <div class="header-buttons">
        <el-button type="primary" @click="openReviewDialog">审核课程</el-button>
        <el-button type="primary" @click="openCreateDialog">创建课程</el-button>
      </div>
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
                  v-for="subject in courseSubjects"
                  :key="subject.value"
                  :label="subject.label"
                  :value="subject.value"
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
                  v-for="type in courseTypes"
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
    
    <div class="course-list">
      <el-table 
        :data="courses" 
        :loading="loading" 
        style="width: 100%" 
        empty-text=""
        :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f7fa' }"
      >
        <el-table-column prop="id" label="课程ID" width="100" />
        <el-table-column prop="courseName" label="课程名称" min-width="300" />
        <el-table-column prop="courseSubject" label="课程科目" width="120">
          <template #default="{ row }">
            {{ courseSubjects.find(s => s.value == row.courseSubject)?.label || row.courseSubject }}
          </template>
        </el-table-column>
        <el-table-column prop="courseType" label="课程类型" width="180">
          <template #default="{ row }">
            {{ courseTypes.find(t => t.value == row.courseType)?.label || row.courseType }}
          </template>
        </el-table-column>
        <el-table-column prop="reviewStatus" label="审核状态" width="120">
          <template #default="{ row }">
            {{ 
              row.reviewStatus === 'PENDING' ? '待审核' :
              row.reviewStatus === 'APPROVED' ? '已通过' :
              row.reviewStatus === 'REJECTED' ? '已拒绝' :
              row.reviewStatus 
            }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="400">
          <template #default="{ row }">
            <el-button size="small" @click="viewCourseDetail(row)" style="margin-right: 5px">查看</el-button>
            <el-button size="small" type="primary" @click="openEditDialog(row)" style="margin-right: 5px">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteCourse(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-state">
            <el-icon class="empty-icon"><i class="el-icon-info"></i></el-icon>
            <p>暂无课程数据</p>
            <p style="font-size: 14px; color: #909399; margin-top: 8px;">点击「创建课程」按钮开始添加课程</p>
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
    
    <!-- 课程编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-form ref="courseFormRef" :model="courseForm" :rules="courseFormRules" label-width="120px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseForm.courseName" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程简介" prop="courseIntroduction">
          <el-input v-model="courseForm.courseIntroduction" type="textarea" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程目标" prop="courseObjective">
          <el-input v-model="courseForm.courseObjective" type="textarea" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程内容" prop="courseContent">
          <el-input v-model="courseForm.courseContent" type="textarea" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程大纲" prop="courseOutline">
          <el-input v-model="courseForm.courseOutline" type="textarea" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程科目" prop="courseSubject">
          <el-select v-model="courseForm.courseSubject" style="width: 100%">
            <el-option v-for="subject in courseSubjects" :key="subject.value" :label="subject.label" :value="subject.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-select v-model="courseForm.courseType" style="width: 100%">
            <el-option v-for="type in courseTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程封面">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :on-success="handleCoverUpload"
            :on-remove="handleCoverRemove"
            :file-list="fileList"
            :auto-upload="false"
            :data="{ id: courseForm.id }"
            accept=".png,.jpg,.jpeg"
            :limit="1"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只上传jpg/png图片，且不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCourse">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 审核课程对话框 -->
    <el-dialog v-model="reviewDialogVisible" :title="reviewDialogTitle" width="1200px">
      <div class="review-dialog-content">
        <el-table 
          :data="courses" 
          style="width: 100%" 
          empty-text=""
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f7fa' }"
        >
          <el-table-column prop="id" label="课程ID" width="100" />
          <el-table-column prop="courseName" label="课程名称" min-width="300" />
          <el-table-column prop="courseSubject" label="课程科目" width="120">
            <template #default="{ row }">
              {{ courseSubjects.find(s => s.value == row.courseSubject)?.label || row.courseSubject }}
            </template>
          </el-table-column>
          <el-table-column prop="courseType" label="课程类型" width="200">
            <template #default="{ row }">
              {{ courseTypes.find(t => t.value == row.courseType)?.label || row.courseType }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="提交时间" width="200" />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button size="small" type="success" @click="reviewCourse(row, 1)" style="margin-right: 5px">通过</el-button>
              <el-button size="small" type="danger" @click="reviewCourse(row, 0)">拒绝</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-state">
              <el-icon class="empty-icon"><i class="el-icon-info"></i></el-icon>
              <p>暂无待审核课程</p>
            </div>
          </template>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false" style="border-color: #dcdfe6; color: #606266; padding: 8px 20px;">
            关闭
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.course-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.search-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}

.el-pagination {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

/* 审核课程对话框样式 */
.review-dialog-content {
  padding: 10px 0;
}

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

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5 !important;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}

:deep(.el-button--success) {
  background-color: #67c23a;
  border-color: #67c23a;
}

:deep(.el-button--danger) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

:deep(.el-button:hover) {
  opacity: 0.8;
}

:deep(.el-dialog__header) {
  background-color: #f5f7fa;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
  background-color: #fafafa;
}

</style>