<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElDialog, ElInputNumber, ElDatePicker, ElSwitch, ElSelect, ElOption, ElMessageBox } from 'element-plus'
import { getCourseResourcePage, deleteCourseResource, modifyCourseResource, downloadCourseResource, uploadCourseResource } from '../../api/courseResource'
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

// 编辑对话框
const editDialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 资源表单
const resourceForm = ref({
  id: '',
  orderId: '',
  name: '',
  resourceType: '',
  courseId: ''
})

const resourceFormRules = {
  orderId: [
    { required: true, message: '请输入排序ID', trigger: 'blur' }
  ],
  name: [
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

// 处理文件变化
const handleFileChange = (file, files) => {
  fileList.value = files
}

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
      pageSize: 100
    })
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
      resourceName: searchForm.value.resourceName,
      resourceType: searchForm.value.resourceType,
      startViewCount: searchForm.value.startViewCount,
      endViewCount: searchForm.value.endViewCount,
      startCreateTime: searchForm.value.startCreateTime,
      endCreateTime: searchForm.value.endCreateTime,
      sortType: searchForm.value.sortType,
      ascending: searchForm.value.ascending,
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

// 处理文件上传
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

// 打开编辑对话框
const handleEdit = (resource) => {
  dialogTitle.value = '编辑教学资源'
  isEdit.value = true
  // 填充表单
  resourceForm.value.id = resource.id
  resourceForm.value.orderId = resource.orderId
  resourceForm.value.name = resource.name
  resourceForm.value.resourceType = resource.resourceType
  resourceForm.value.courseId = resource.courseId
  fileList.value = resource.uri ? [{ url: resource.uri }] : []
  editDialogVisible.value = true
}

// 保存资源
const saveResource = async () => {
  await resourceFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // // 构建符合要求的path格式：CourseResource/{课程资源ID}/{文件名}
        // const path = `CourseResource/${resource.id}/${fileName}`
        // const response = await downloadCourseResource(path)

        const response = await modifyCourseResource(resourceForm.value)
        if (response.data.code === 200) {
          // 如果有文件，上传附件
          if (fileList.value.length > 0 && fileList.value[0].raw) {
            console.log('准备上传文件，资源ID:', resourceForm.value.id)
            console.log('文件信息:', fileList.value[0])
            await uploadCourseResource(resourceForm.value.id, fileList.value[0].raw)
            ElMessage.success('修改教学资源和上传文件成功')
          } else {
            ElMessage.success('修改教学资源成功')
          }
          editDialogVisible.value = false
          loadResources()
        } else {
          ElMessage.error(response.data.message || '修改教学资源失败')
        }
      } catch (error) {
        ElMessage.error('修改教学资源失败')
      }
    }
  })
}

// 下载资源
const handleDownload = async (resource) => {
  if (!resource.uri) {
    ElMessage.error('资源文件不存在')
    return
  }
  
  try {
    console.log('资源对象:', resource)
    // 从uri中提取文件名
    const file = resource.uri.split('/').pop()
    console.log('提取的文件名:', file)
    const response = await downloadCourseResource(resource.id, file)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载教学资源失败:', error)
    ElMessage.error('下载教学资源失败')
  }
}

const handleDelete = async (resource) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除资源「${resource.name}」吗？\n删除后将无法恢复。`,
      '删除资源',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )
    
    loading.value = true
    await deleteCourseResource(resource.id)
    ElMessage.success('资源删除成功')
    loadResources()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('资源删除失败：' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
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
                  :label="course.name"
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
      <el-table-column prop="orderId" label="排序ID" width="140" />
      <el-table-column prop="name" label="资源名称" min-width="300" />
      <el-table-column prop="resourceType" label="资源类型" width="140">
        <template #default="scope">
          {{ scope.row.resourceType === 'VIDEO' ? '视频' : scope.row.resourceType === 'MATERIAL' ? '课件' : '参考资料' }}
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="查看次数" width="140" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button size="small" @click="handleResourceDetail(scope.row.id)" style="margin-right: 5px">查看</el-button>
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" style="margin-right: 5px">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" style="margin-right: 5px">删除</el-button>
          <el-button size="small" @click="handleDownload(scope.row)">下载</el-button>
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
    
    <!-- 编辑资源对话框 -->
    <el-dialog v-model="editDialogVisible" :title="dialogTitle" width="900px">
      <el-form ref="resourceFormRef" :model="resourceForm" :rules="resourceFormRules" label-width="120px">
        <el-form-item label="排序ID" prop="orderId">
          <el-input v-model="resourceForm.orderId" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="resourceForm.name" style="width: 100%"></el-input>
        </el-form-item>
        <el-form-item label="资源类型" prop="resourceType">
          <el-select v-model="resourceForm.resourceType" style="width: 100%">
            <el-option v-for="option in resourceTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="resourceForm.courseId" style="width: 100%">
              <el-option v-for="course in courses" :key="course.id" :label="course.name" :value="course.id" />
            </el-select>
        </el-form-item>
        <el-form-item label="资源文件">
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
                支持上传视频、课件、参考资料等文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveResource">保存</el-button>
        </span>
      </template>
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

</style>