<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElPagination, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElUpload } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as courseApi from '../../api/course'
import * as courseResourceApi from '../../api/courseResource'

const router = useRouter()
const userStore = useUserStore()

// 课程列表
const courses = ref([])
const selectedCourseId = ref('')

// 教学资源列表
const courseResources = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索条件
const searchForm = reactive({
  resourceName: '',
  resourceType: ''
})

// 教学资源类型选项
const resourceTypes = [
  { value: 'VIDEO', label: '视频' },
  { value: 'MATERIAL', label: '课件' },
  { value: 'REFERENCE', label: '参考资料' }
]

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 教学资源表单
const resourceForm = reactive({
  id: '',
  sortId: '',
  resourceName: '',
  resourceType: '',
  courseId: ''
})

const resourceFormRules = {
  sortId: [
    { required: true, message: '请输入排序ID', trigger: 'blur' }
  ],
  resourceName: [
    { required: true, message: '请输入资源名称', trigger: 'blur' }
  ],
  resourceType: [
    { required: true, message: '请选择资源类型', trigger: 'change' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ]
}

const resourceFormRef = ref(null)

// 上传文件
const uploadUrl = '/api/courseResource/uploadCourseResource'
const fileList = ref([])
const handleResourceUpload = (response, uploadFile) => {
  if (response.data.code === 200) {
    ElMessage.success('资源上传成功')
  } else {
    ElMessage.error('资源上传失败')
  }
}

const handleResourceRemove = (file, fileList) => {
  // 移除文件时的处理
}

// 获取课程列表
const getCourses = async () => {
  try {
    let response
    if (userStore.roleType === 'STUDENT') {
      // 学生获取选修的课程
      response = await courseApi.getSelectCoursePage({})
    } else {
      // 教师和管理员获取创建的课程
      response = await courseApi.getCreateCoursePage({})
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

// 获取教学资源列表
const getCourseResources = async () => {
  if (!selectedCourseId.value) {
    courseResources.value = []
    total.value = 0
    return
  }
  
  loading.value = true
  try {
    const response = await courseResourceApi.getCourseResourcePage({
      courseId: selectedCourseId.value,
      resourceName: searchForm.resourceName,
      resourceType: searchForm.resourceType,
      current: currentPage.value,
      size: pageSize.value
    })
    if (response.data.code === 200) {
      courseResources.value = response.data.data.records
      total.value = response.data.data.total
    } else {
      ElMessage.error(response.data.message || '获取教学资源列表失败')
    }
  } catch (error) {
    ElMessage.error('获取教学资源列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索教学资源
const handleSearch = () => {
  currentPage.value = 1
  getCourseResources()
}

// 重置搜索
const handleReset = () => {
  searchForm.resourceName = ''
  searchForm.resourceType = ''
  currentPage.value = 1
  getCourseResources()
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  getCourseResources()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getCourseResources()
}

// 打开创建教学资源对话框
const openCreateDialog = () => {
  dialogTitle.value = '创建教学资源'
  isEdit.value = false
  // 重置表单
  resourceForm.id = ''
  resourceForm.sortId = ''
  resourceForm.resourceName = ''
  resourceForm.resourceType = ''
  resourceForm.courseId = ''
  fileList.value = []
  dialogVisible.value = true
}

// 打开编辑教学资源对话框
const openEditDialog = (resource) => {
  dialogTitle.value = '修改教学资源'
  isEdit.value = true
  // 填充表单
  resourceForm.id = resource.id
  resourceForm.sortId = resource.sortId
  resourceForm.resourceName = resource.resourceName
  resourceForm.resourceType = resource.resourceType
  resourceForm.courseId = resource.courseId
  fileList.value = resource.resourceUrl ? [{ url: resource.resourceUrl }] : []
  dialogVisible.value = true
}

// 保存教学资源
const saveResource = async () => {
  await resourceFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response
        if (isEdit.value) {
          response = await courseResourceApi.modifyCourseResource(resourceForm)
        } else {
          response = await courseResourceApi.createCourseResource(resourceForm)
        }
        if (response.data.code === 200) {
          ElMessage.success(isEdit.value ? '修改教学资源成功' : '创建教学资源成功')
          dialogVisible.value = false
          getCourseResources()
        } else {
          ElMessage.error(response.data.message || (isEdit.value ? '修改教学资源失败' : '创建教学资源失败'))
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? '修改教学资源失败' : '创建教学资源失败')
      }
    }
  })
}

// 删除教学资源
const deleteResource = (resource) => {
  ElMessageBox.confirm(`确定要删除教学资源「${resource.resourceName}」吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await courseResourceApi.deleteCourseResource(resource.id)
      if (response.data.code === 200) {
        ElMessage.success('删除教学资源成功')
        getCourseResources()
      } else {
        ElMessage.error(response.data.message || '删除教学资源失败')
      }
    } catch (error) {
      ElMessage.error('删除教学资源失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 查看教学资源详情
const viewResourceDetail = (resource) => {
  // 跳转到教学资源详情页面
  router.push(`/course-resource/detail/${resource.id}`)
}

// 下载教学资源
const downloadResource = async (resource) => {
  try {
    const response = await courseResourceApi.downloadCourseResource(resource.resourceUrl)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    // 从URL中提取文件名
    const fileName = resource.resourceUrl.split('/').pop()
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    ElMessage.error('下载教学资源失败')
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
  <div class="course-resource-management">
    <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>教学资源管理</h2>
      <el-button type="primary" @click="openCreateDialog">创建教学资源</el-button>
    </div>
    
    <div class="search-form">
      <el-form :model="{ courseId: selectedCourseId, ...searchForm }" inline>
        <el-form-item label="选择课程">
          <el-select v-model="selectedCourseId" placeholder="请选择课程" @change="getCourseResources" style="width: 200px;">
            <el-option v-for="course in courses" :key="course.id" :label="course.courseName" :value="course.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源名称">
          <el-input v-model="searchForm.resourceName" placeholder="请输入资源名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="searchForm.resourceType" placeholder="请选择资源类型" style="width: 150px;">
            <el-option v-for="type in resourceTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" style="margin-right: 8px;">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="resource-list">
      <el-table 
        :data="courseResources" 
        :loading="loading" 
        style="width: 100%" 
        empty-text=""
        :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f7fa' }"
      >
        <el-table-column prop="sortId" label="排序ID" width="80" />
        <el-table-column prop="resourceName" label="资源名称" min-width="300" />
        <el-table-column prop="resourceType" label="资源类型" width="120">
          <template #default="{ row }">
            {{ resourceTypes.find(t => t.value == row.resourceType)?.label || row.resourceType }}
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="查看次数" width="140" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button size="small" @click="viewResourceDetail(row)" style="margin-right: 5px">查看</el-button>
            <el-button size="small" type="primary" @click="openEditDialog(row)" style="margin-right: 5px">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteResource(row)" style="margin-right: 5px">删除</el-button>
            <el-button size="small" @click="downloadResource(row)">下载</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-state">
            <el-icon class="empty-icon"><i class="el-icon-info"></i></el-icon>
            <p>暂无数据</p>
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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 教学资源编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form ref="resourceFormRef" :model="resourceForm" :rules="resourceFormRules" label-width="100px" label-position="left">
        <el-form-item label="排序ID" prop="sortId">
          <el-input v-model="resourceForm.sortId"  />
        </el-form-item>
        <el-form-item label="资源名称" prop="resourceName">
          <el-input v-model="resourceForm.resourceName"  />
        </el-form-item>
        <el-form-item label="资源类型" prop="resourceType">
          <el-select v-model="resourceForm.resourceType" >
            <el-option v-for="type in resourceTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="resourceForm.courseId" >
            <el-option v-for="course in courses" :key="course.id" :label="course.courseName" :value="course.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源文件">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :on-success="handleResourceUpload"
            :on-remove="handleResourceRemove"
            :file-list="fileList"
            :auto-upload="false"
            :data="{ id: resourceForm.id }"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持上传视频、课件、参考资料等文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveResource">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.course-resource-management {
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

.resource-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
