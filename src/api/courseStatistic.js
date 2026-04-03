import request from '../utils/request'

// 全站课程数量统计
export const getOverallCourseCount = () => {
  return request({
    url: '/api/courseStatistic/overallCourseCount',
    method: 'get'
  })
}

// 个人课程数量统计
export const getPersonalCourseCount = () => {
  return request({
    url: '/api/courseStatistic/personalCourseCount',
    method: 'get'
  })
}

// 全站选课人数统计
export const getOverallSelectCount = () => {
  return request({
    url: '/api/courseStatistic/overallSelectCount',
    method: 'get'
  })
}

// 个人选课人数统计
export const getPersonalSelectCount = () => {
  return request({
    url: '/api/courseStatistic/personalSelectCount',
    method: 'get'
  })
}

// 全站课程完成率平均统计
export const getOverallCourseCompletionRateAverage = () => {
  return request({
    url: '/api/courseStatistic/overallCourseCompletionRateAverage',
    method: 'get'
  })
}

// 个人课程完成率平均统计
export const getPersonalCourseCompletionRateAverage = () => {
  return request({
    url: '/api/courseStatistic/personalCourseCompletionRateAverage',
    method: 'get'
  })
}

// 全站课程完成率排行统计
export const getOverallCourseCompletionRateRank = () => {
  return request({
    url: '/api/courseStatistic/overallCourseCompletionRateRank',
    method: 'get'
  })
}

// 个人课程完成率排行统计
export const getPersonalCourseCompletionRateRank = () => {
  return request({
    url: '/api/courseStatistic/personalCourseCompletionRateRank',
    method: 'get'
  })
}

// 全站课程完成率分段统计
export const getOverallCourseCompletionRateSectional = () => {
  return request({
    url: '/api/courseStatistic/overallCourseCompletionRateSectional',
    method: 'get'
  })
}

// 个人课程完成率分段统计
export const getPersonalCourseCompletionRateSectional = () => {
  return request({
    url: '/api/courseStatistic/personalCourseCompletionRateSectional',
    method: 'get'
  })
}
