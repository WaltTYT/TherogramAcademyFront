import request from '../utils/request'

export const teacherUserCount = () => {
  return request({
    url: '/instructionStatistic/teacherUserCount',
    method: 'get'
  })
}

export const studentUserCount = () => {
  return request({
    url: '/instructionStatistic/studentUserCount',
    method: 'get'
  })
}

export const overallStudyTime = () => {
  return request({
    url: '/instructionStatistic/overallStudyTime',
    method: 'get'
  })
}

export const personalStudyTime = () => {
  return request({
    url: '/instructionStatistic/personalStudyTime',
    method: 'get'
  })
}

export const overallScoreAverage = () => {
  return request({
    url: '/instructionStatistic/overallScoreAverage',
    method: 'get'
  })
}

export const personalScoreAverage = () => {
  return request({
    url: '/instructionStatistic/personalScoreAverage',
    method: 'get'
  })
}

export const overallScoreRank = () => {
  return request({
    url: '/instructionStatistic/overallScoreRank',
    method: 'get'
  })
}

export const personalScoreRank = () => {
  return request({
    url: '/instructionStatistic/personalScoreRank',
    method: 'get'
  })
}

export const overallScoreSectional = () => {
  return request({
    url: '/instructionStatistic/overallScoreSectional',
    method: 'get'
  })
}

export const personalScoreSectional = () => {
  return request({
    url: '/instructionStatistic/personalScoreSectional',
    method: 'get'
  })
}