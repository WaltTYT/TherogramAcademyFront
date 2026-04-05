<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElTable, ElTableColumn, ElButton, ElPagination, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElUpload, ElInputNumber, ElDatePicker, ElSwitch, ElMessage as ElMessage2 } from 'element-plus'
import * as courseApi from '../../api/course'

const router = useRouter()
const courses = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 搜索条件
const searchForm = ref({
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

const dialogVisible = ref(false)
const editMode = ref(false)
const currentCourse = ref(null)

const courseForm = ref({
  courseName: '',
  courseDescription: '',
  courseObjective: '',
  courseContent: '',
  courseOutline: '',
  courseSubject: '',
  courseType: '',
  courseCover: ''
})

const courseRules = {
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

const handleCreateCourse = () => {
  editMode.value = false
  currentCourse.value = null
  courseForm.value = {
    courseName: '',
    courseDescription: '',
    courseObjective: '',
    courseContent: '',
    courseOutline: '',
    courseSubject: '',
    courseType: '',
    courseCover: ''
  }
  dialogVisible.value = true
}

const handleEditCourse = (course) => {
  editMode.value = true
  currentCourse.value = course
  courseForm.value = {
    courseName: course.courseName,
    courseDescription: course.courseDescription,
    courseObjective: course.courseObjective || '',
    courseContent: course.courseContent || '',
    courseOutline: course.courseOutline || '',
    courseSubject: course.courseSubject,
    courseType: course.courseType,
    courseCover: course.courseCover || ''
  }
  dialogVisible.value = true
}

const handleDeleteCourse = async (courseId) => {
  try {
    await courseApi.deleteCourse(courseId)
    ElMessage.success('课程删除成功')
    getCourses()
  } catch (error) {
    ElMessage.error('课程删除失败')
  }
}

const handleCourseDetail = (courseId) => {
  router.push(`/teacher/course/${courseId}`)
}

const handleFileChange = (file) => {
  courseForm.value.courseCover = file.raw
}

const handleSubmit = async () => {
  try {
    await courseFormRef.value.validate()
    if (editMode.value) {
      await courseApi.updateCourse(currentCourse.value.courseId, courseForm.value)
      ElMessage.success('课程更新成功')
    } else {
      await courseApi.createCourse(courseForm.value)
      ElMessage.success('课程创建成功')
    }
    dialogVisible.value = false
    getCourses()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getCourses = async () => {
  try {
    loading.value = true
    const response = await courseApi.getCoursePage({
      name: searchForm.value.courseName,
      subjectId: searchForm.value.courseSubject,
      typeId: searchForm.value.courseType,
      isSelected: "false",
      startSelectCount: searchForm.value.startSelectCount || "0",
      endSelectCount: searchForm.value.endSelectCount || "7",
      startCreateTime: searchForm.value.startCreateTime || "2025-01-01T12:00:00",
      endCreateTime: searchForm.value.endCreateTime || "2027-01-01T12:00:00",
      sortType: searchForm.value.sortType || "1",
      isAsc: searchForm.value.ascending?.toString() || "true",
      pageNum: page.value,
      pageSize: pageSize.value
    })
    courses.value = response.data.data.records
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索课程
const handleSearch = () => {
  page.value = 1
  getCourses()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    courseName: '',
    courseSubject: '',
    courseType: '',
    startSelectCount: null,
    endSelectCount: null,
    startCreateTime: '',
    endCreateTime: '',
    sortType: 0,
    ascending: true
  }
  page.value = 1
  getCourses()
}

// 切换高级搜索
const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
  if (!showAdvancedSearch.value) {
    searchForm.value = {
      courseName: '',
      courseSubject: '',
      courseType: '',
      startSelectCount: null,
      endSelectCount: null,
      startCreateTime: '',
      endCreateTime: '',
      sortType: 0,
      ascending: true
    }
  }
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
  <div class="course-manage-container">
    <div class="header">
      <h2>我的课程</h2>
      <el-button type="primary" @click="handleCreateCourse">创建课程</el-button>
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
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="240">
        <template #default="scope">
          <el-button size="small" @click="handleCourseDetail(scope.row.courseId)" style="margin-right: 5px">查看</el-button>
          <el-button size="small" type="primary" @click="handleEditCourse(scope.row)" style="margin-right: 5px">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDeleteCourse(scope.row.courseId)">删除</el-button>
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
    
    <el-dialog
      :title="editMode ? '编辑课程' : '创建课程'"
      v-model="dialogVisible"
      width="900px"
    >
      <el-form ref="courseFormRef" :model="courseForm" :rules="courseRules" label-width="120px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseForm.courseName" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程简介" prop="courseDescription">
          <el-input v-model="courseForm.courseDescription" type="textarea" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程目标">
          <el-input v-model="courseForm.courseObjective" type="textarea" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程内容">
          <el-input v-model="courseForm.courseContent" type="textarea" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程大纲">
          <el-input v-model="courseForm.courseOutline" type="textarea" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="课程科目" prop="courseSubject">
          <el-select v-model="courseForm.courseSubject" style="width: 100%">
            <el-option 
              v-for="(subject, index) in courseSubjects" 
              :key="index" 
              :label="subject.label" 
              :value="subject.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-select v-model="courseForm.courseType" style="width: 100%">
            <el-option 
              v-for="(type, index) in courseTypes" 
              :key="index" 
              :label="type.label" 
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程封面">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
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
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.course-manage-container {
  padding: 20px;
}

.search-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  width: 100%;
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

/* 对话框样式优化 */
:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}

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
</style>