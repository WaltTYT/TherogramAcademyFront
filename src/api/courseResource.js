import request from '../utils/request'

// 创建教学资源
export const createCourseResource = (data) => {
  return request({
    url: '/courseResource/create',
    method: 'post',
    data
  })
}

// 修改教学资源
export const modifyCourseResource = (data) => {
  return request({
    url: '/courseResource/modify',
    method: 'post',
    data
  })
}

// 删除教学资源
export const deleteCourseResource = (id) => {
  return request({
    url: `/courseResource/delete/${id}`,
    method: 'post'
  })
}

// 获取教学资源分页
export const getCourseResourcePage = (data) => {
  // 修复字段名
  const fixedData = {
    ...data,
    name: data.resourceName,
    isAsc: data.ascending
  }
  delete fixedData.resourceName
  delete fixedData.ascending
  return request({
    url: '/courseResource/page',
    method: 'post',
    data: fixedData
  })
}

// 获取教学资源详情
export const getCourseResourceDetail = (id) => {
  return request({
    url: `/courseResource/detail/${id}`,
    method: 'get'
  })
}

// 上传教学资源
export const uploadCourseResource = (id, file) => {
  console.log('上传教学资源 - ID:', id)
  console.log('上传教学资源 - 文件:', file)
  console.log('上传教学资源 - 文件大小:', file?.size)
  console.log('上传教学资源 - 文件类型:', file?.type)
  
  const formData = new FormData()
  formData.append('id', id)
  formData.append('file', file)
  
  // 验证 FormData 内容
  for (let pair of formData.entries()) {
    console.log('FormData -', pair[0], ':', pair[1])
  }
  
  return request({
    url: '/courseResource/uploadCourseResource',
    method: 'post',
    data: formData
  })
}

// 下载教学资源
export const downloadCourseResource = (id, fileName) => {
  return request({
    url: `/courseResource/downloadCourseResource?id=${id}&file=${encodeURIComponent(fileName)}`,
    method: 'get',
    responseType: 'blob'
  })
}


// 通过课程获取所有未删除的教学资源
export const getCourseResourcesByCourseId = (courseId) => {
  return request({
    url: `/courseResource/courseResources/${courseId}`,
    method: 'get'
  })
}
