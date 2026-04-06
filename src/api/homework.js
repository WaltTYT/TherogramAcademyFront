import request from '../utils/request'

// 创建作业
export const createHomework = (data) => {
  return request({
    url: '/homework/create',
    method: 'post',
    data
  })
}

// 修改作业
export const modifyHomework = (data) => {
  return request({
    url: '/homework/modify',
    method: 'post',
    data
  })
}

// 删除作业
export const deleteHomework = (id) => {
  return request({
    url: `/homework/delete/${id}`,
    method: 'post'
  })
}

// 获取作业分页
export const getHomeworkPage = (data) => {
  return request({
    url: '/homework/page',
    method: 'post',
    data
  })
}

// 获取学生作业分页
export const getStudentHomeworkPage = (data) => {
  return request({
    url: '/homework/studentPage',
    method: 'post',
    data
  })
}

// 获取作业详情
export const getHomeworkDetail = (id) => {
  return request({
    url: `/homework/detail/${id}`,
    method: 'get'
  })
}

// 获取学生作业详情
export const getStudentHomeworkDetail = (studentId, homeworkId) => {
  return request({
    url: `/homework/studentDetail/${studentId}/${homeworkId}`,
    method: 'get'
  })
}

// 提交作业
export const submitHomework = (data) => {
  return request({
    url: '/homework/submit',
    method: 'post',
    data
  })
}

// 评定作业
export const evaluateHomework = (data) => {
  return request({
    url: '/homework/evaluate',
    method: 'post',
    data
  })
}

// 提醒作业
export const remindHomework = () => {
  return request({
    url: '/homework/remind',
    method: 'get'
  })
}

// 上传作业附件
export const uploadHomework = (id, file) => {
  const formData = new FormData()
  formData.append('id', id)
  formData.append('file', file)
  return request({
    url: '/homework/uploadHomework',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传学生作业附件
export const uploadStudentHomework = (studentId, homeworkId, file) => {
  const formData = new FormData()
  formData.append('studentId', studentId)
  formData.append('homeworkId', homeworkId)
  formData.append('file', file)
  return request({
    url: '/homework/uploadHomework',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载作业附件
export const downloadHomework = (relativePath) => {
  return request({
    url: `/homework/downloadHomework/${relativePath}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 下载学生作业附件
export const downloadStudentHomework = (relativePath) => {
  return request({
    url: `/homework/downloadStudentHomework/${relativePath}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 通过课程获取所有未删除的作业
export const getHomeworksByCourse = (courseId) => {
  return request({
    url: `/homework/homeworks/${courseId}`,
    method: 'get'
  })
}

// 通过课程ID列表获取所有未删除的作业
export const getHomeworksByCourseIds = (courseIds) => {
  return request({
    url: '/homework/homeworks',
    method: 'post',
    data: courseIds
  })
}
