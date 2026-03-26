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