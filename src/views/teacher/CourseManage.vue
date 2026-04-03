<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElTable, ElTableColumn, ElButton, ElPagination, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElUpload, ElMessage as ElMessage2 } from 'element-plus'
import * as courseApi from '../../api/course'

const router = useRouter()
const courses = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

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
    const response = await courseApi.getCourses({ page: page.value, pageSize: pageSize.value })
    courses.value = response.data.data.records
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
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
      width="800px"
    >
      <el-form ref="courseFormRef" :model="courseForm" :rules="courseRules" label-width="100px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseForm.courseName"></el-input>
        </el-form-item>
        <el-form-item label="课程简介" prop="courseDescription">
          <el-input v-model="courseForm.courseDescription" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="课程目标">
          <el-input v-model="courseForm.courseObjective" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="课程内容">
          <el-input v-model="courseForm.courseContent" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="课程大纲">
          <el-input v-model="courseForm.courseOutline" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="课程科目" prop="courseSubject">
          <el-select v-model="courseForm.courseSubject">
            <el-option label="数学" value="数学"></el-option>
            <el-option label="语文" value="语文"></el-option>
            <el-option label="英语" value="英语"></el-option>
            <el-option label="物理" value="物理"></el-option>
            <el-option label="化学" value="化学"></el-option>
            <el-option label="生物" value="生物"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-select v-model="courseForm.courseType">
            <el-option label="必修课" value="必修课"></el-option>
            <el-option label="选修课" value="选修课"></el-option>
            <el-option label="通识课" value="通识课"></el-option>
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

</style>