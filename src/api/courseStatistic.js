import request from '../utils/request'

// 全站课程数量统计
export const getOverallCourseCount = () => {
  return request({
    url: '/courseStatistic/overallCourseCount',
    method: 'get'
  })
}

// 个人课程数量统计
export const getPersonalCourseCount = () => {
  return request({
    url: '/courseStatistic/personalCourseCount',
    method: 'get'
  })
}

// 全站选课人数统计
export const getOverallSelectCount = () => {
  return request({
    url: '/courseStatistic/overallSelectCount',
    method: 'get'
  })
}

// 个人选课人数统计
export const getPersonalSelectCount = () => {
  return request({
    url: '/courseStatistic/personalSelectCount',
    method: 'get'
  })
}

// 全站课程完成率平均统计
export const getOverallCourseCompletionRateAverage = () => {
  return request({
    url: '/courseStatistic/overallCourseCompletionRateAverage',
    method: 'get'
  })
}

// 个人课程完成率平均统计
export const getPersonalCourseCompletionRateAverage = () => {
  return request({
    url: '/courseStatistic/personalCourseCompletionRateAverage',
    method: 'get'
  })
}

// 全站课程完成率排行统计
export const getOverallCourseCompletionRateRank = () => {
  return request({
    url: '/courseStatistic/overallCourseCompletionRateRank',
    method: 'get'
  })
}

// 个人课程完成率排行统计
export const getPersonalCourseCompletionRateRank = () => {
  return request({
    url: '/courseStatistic/personalCourseCompletionRateRank',
    method: 'get'
  })
}

// 全站课程完成率分段统计
export const getOverallCourseCompletionRateSectional = () => {
  return request({
    url: '/courseStatistic/overallCourseCompletionRateSectional',
    method: 'get'
  })
}

// 个人课程完成率分段统计
export const getPersonalCourseCompletionRateSectional = () => {
  return request({
    url: '/courseStatistic/personalCourseCompletionRateSectional',
    method: 'get'
  })
}
