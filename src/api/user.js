import request from '../utils/request'

// 登录
export const login = (data) => {
  return request.post('/user/login', data)
}

// 注册
export const register = (data) => {
  return request.post('/user/create', data)
}

// 退出登录
export const logout = () => {
  return request.post('/user/logout')
}

// 获取用户详情
export const getUserDetail = () => {
  return request.get('/user/detail')
}

// 修改用户信息
export const updateUser = (data) => {
  return request.post('/user/modify', data)
}

// 删除用户
export const deleteUser = () => {
  return request.post('/user/delete')
}

// 获取用户分页
export const getUserPage = (data) => {
  return request.post('/user/page', data)
}

// 关键字搜索用户分页
export const searchUserPage = (data) => {
  return request.post('/user/searchPage', data)
}

// 上传用户头像
export const uploadUserAvatar = (id, file) => {
  const formData = new FormData()
  formData.append('id', id)
  formData.append('file', file)
  return request.post('/user/uploadUser', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载用户头像
export const downloadUserAvatar = (relativePath) => {
  return request.get(`/user/downloadUser/${relativePath}`, {
    responseType: 'blob'
  })
}

// 通过ID获取用户名
export const getUsernameById = (id) => {
  return request.get(`/user/username/${id}`)
}