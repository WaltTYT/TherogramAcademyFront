import request from '../utils/request'

// 创建课程
export const createCourse = (data) => {
  return request.post('/course/create', data)
}

// 修改课程
export const modifyCourse = (data) => {
  return request.post('/course/modify', data)
}

// 删除课程
export const deleteCourse = (id) => {
  return request.post(`/course/delete/${id}`)
}

// 获取课程分页
export const getCoursePage = (data) => {
  return request.post('/course/page', data)
}

// 获取创建课程分页
export const getCreateCoursePage = (data) => {
  return request.post('/course/createPage', data)
}

// 获取选修课程分页
export const getSelectCoursePage = (data) => {
  return request.post('/course/selectPage', data)
}

// 关键字搜索课程分页
export const searchCoursePage = (data) => {
  return request.post('/course/searchPage', data)
}

// 获取课程详情
export const getCourseDetail = (id) => {
  return request.get(`/course/detail/${id}`)
}

// 获取创建课程详情
export const getCreateCourseDetail = (id) => {
  return request.get(`/course/createDetail/${id}`)
}

// 获取选修课程详情
export const getSelectCourseDetail = (id) => {
  return request.get(`/course/selectDetail/${id}`)
}

// 审核课程
export const reviewCourse = (data) => {
  return request.post('/course/review1', data)//先禁用
}

// 选修课程
export const selectCourse = (id) => {
  return request.post(`/course/select/${id}`)
}

// 退选课程
export const deselectCourse = (id) => {
  return request.post(`/course/deselect/${id}`)
}

// 更新课程进度和学习时间
export const updateCourseProgress = (data) => {
  return request.post('/course/update', data)
}

// 评定课程
export const evaluateCourse = (data) => {
  return request.post('/course/evaluate', data)
}

// 推荐课程
export const getRecommendedCourses = (params) => {
  return request.get('/course/recommend', { params })
}

// 上传课程封面
export const uploadCourseCover = (id, file) => {
  const formData = new FormData()
  formData.append('id', id)
  formData.append('file', file)
  return request.post('/course/uploadCourse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载课程封面
export const downloadCourseCover = (relativePath) => {
  return request.get(`/course/downloadCourse/${relativePath}`, {
    responseType: 'blob'
  })
}

// 通过课程获取所有未退选的学生
export const getCourseStudents = (id) => {
  return request.get(`/course/students/${id}`)
}

// 通过用户id获取该用户创建的课程
export const getCreatedCoursesByUserId = (id) => {
  return request.get(`/course/createCourses/${id}`)
}

// 通过用户id获取该用户选修的课程
export const getSelectedCoursesByUserId = (id) => {
  return request.get(`/course/selectCourses/${id}`)
}