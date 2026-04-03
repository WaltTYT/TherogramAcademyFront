import request from '../utils/request'

export const teacherUserCount = () => {
  return request({
    url: '/api/instructionStatistic/teacherUserCount',
    method: 'get'
  })
}

export const studentUserCount = () => {
  return request({
    url: '/api/instructionStatistic/studentUserCount',
    method: 'get'
  })
}

export const overallStudyTime = () => {
  return request({
    url: '/api/instructionStatistic/overallStudyTime',
    method: 'get'
  })
}

export const personalStudyTime = () => {
  return request({
    url: '/api/instructionStatistic/personalStudyTime',
    method: 'get'
  })
}

export const overallScoreAverage = () => {
  return request({
    url: '/api/instructionStatistic/overallScoreAverage',
    method: 'get'
  })
}

export const personalScoreAverage = () => {
  return request({
    url: '/api/instructionStatistic/personalScoreAverage',
    method: 'get'
  })
}

export const overallScoreRank = () => {
  return request({
    url: '/api/instructionStatistic/overallScoreRank',
    method: 'get'
  })
}

export const personalScoreRank = () => {
  return request({
    url: '/api/instructionStatistic/personalScoreRank',
    method: 'get'
  })
}

export const overallScoreSectional = () => {
  return request({
    url: '/api/instructionStatistic/overallScoreSectional',
    method: 'get'
  })
}

export const personalScoreSectional = () => {
  return request({
    url: '/api/instructionStatistic/personalScoreSectional',
    method: 'get'
  })
}