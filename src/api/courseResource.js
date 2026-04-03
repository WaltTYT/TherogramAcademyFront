import request from '../utils/request'

// 创建教学资源
export const createCourseResource = (data) => {
  return request({
    url: '/api/courseResource/create',
    method: 'post',
    data
  })
}

// 修改教学资源
export const modifyCourseResource = (data) => {
  return request({
    url: '/api/courseResource/modify',
    method: 'post',
    data
  })
}

// 删除教学资源
export const deleteCourseResource = (id) => {
  return request({
    url: `/api/courseResource/delete/${id}`,
    method: 'post'
  })
}

// 获取教学资源分页
export const getCourseResourcePage = (data) => {
  return request({
    url: '/api/courseResource/page',
    method: 'post',
    data
  })
}

// 获取教学资源详情
export const getCourseResourceDetail = (id) => {
  return request({
    url: `/api/courseResource/detail/${id}`,
    method: 'get'
  })
}

// 上传教学资源
export const uploadCourseResource = (id, file) => {
  const formData = new FormData()
  formData.append('id', id)
  formData.append('file', file)
  return request({
    url: '/api/courseResource/uploadCourseResource',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载教学资源
export const downloadCourseResource = (relativePath) => {
  return request({
    url: `/api/courseResource/downloadCourseResource/${relativePath}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 通过课程获取所有未删除的教学资源
export const getCourseResourcesByCourseId = (courseId) => {
  return request({
    url: `/api/courseResource/courseResources/${courseId}`,
    method: 'get'
  })
}
