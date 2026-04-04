<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElTable, ElTableColumn, ElProgress } from 'element-plus'
import { Timer, DataAnalysis, Check } from '@element-plus/icons-vue'
import { getPersonalCourseCompletionRateAverage, getPersonalCourseCompletionRateRank, getPersonalCourseCompletionRateSectional } from '../../api/courseStatistic'
import { personalStudyTime, personalScoreAverage, personalScoreRank, personalScoreSectional } from '../../api/instructionStatistic'

const studyStats = ref({
  studyTime: 0,
  averageScore: 0,
  completionRate: 0
})

const loading = ref(false)
const completionRateRank = ref({})
const scoreRank = ref({})

const loadStudyStats = async () => {
  loading.value = true
  try {
    // 加载学习统计数据
    const studyTimeResponse = await personalStudyTime()
    const scoreAverageResponse = await personalScoreAverage()
    const completionRateResponse = await getPersonalCourseCompletionRateAverage()
    
    studyStats.value = {
      studyTime: studyTimeResponse.data.data,
      averageScore: scoreAverageResponse.data.data,
      completionRate: completionRateResponse.data.data
    }
  } catch (error) {
    ElMessage.error('获取学习统计数据失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const loadRankings = async () => {
  loading.value = true
  try {
    // 加载课程完成率排行
    const completionRateResponse = await getPersonalCourseCompletionRateRank()
    completionRateRank.value = completionRateResponse.data.data || {}
    
    // 加载成绩排行
    const scoreResponse = await personalScoreRank()
    scoreRank.value = scoreResponse.data.data || {}
  } catch (error) {
    ElMessage.error('获取排行榜数据失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理完成率排行数据
const completionRateRankData = computed(() => {
  return Object.entries(completionRateRank.value)
    .map(([courseName, rate]) => ({ courseName, rate }))
    .sort((a, b) => b.rate - a.rate)
})

// 处理成绩排行数据
const scoreRankData = computed(() => {
  return Object.entries(scoreRank.value)
    .map(([courseName, score]) => ({ courseName, score }))
    .sort((a, b) => b.score - a.score)
})

onMounted(async () => {
  await loadStudyStats()
  await loadRankings()
})</script>

<template>
  <div class="statistic-container">
    <h2>学习统计</h2>
    
    <div class="stats-section">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon time-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ studyStats.studyTime }}</div>
            <div class="stat-label">学习时长(分钟)</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon score-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ studyStats.averageScore }}</div>
            <div class="stat-label">平均成绩</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon completion-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ studyStats.completionRate }}%</div>
            <div class="stat-label">课程完成率</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="charts-section">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>课程完成率排行</span>
          </div>
        </template>
        <div class="chart-content">
          <el-table v-if="completionRateRankData.length > 0" :data="completionRateRankData" style="width: 100%" size="small">
            <el-table-column prop="courseName" label="课程名称" min-width="150" />
            <el-table-column prop="rate" label="完成率" width="150">
              <template #default="{ row }">
                <div class="completion-rate">
                  <span>{{ row.rate }}%</span>
                  <el-progress :percentage="row.rate" :format="() => ''" :stroke-width="8" />
                </div>
              </template>
            </el-table-column>
          </el-table>
          <p v-else>暂无课程完成率数据</p>
        </div>
      </el-card>
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>成绩排行</span>
          </div>
        </template>
        <div class="chart-content">
          <el-table v-if="scoreRankData.length > 0" :data="scoreRankData" style="width: 100%" size="small">
            <el-table-column prop="courseName" label="课程名称" min-width="150" />
            <el-table-column prop="score" label="成绩" width="100" />
          </el-table>
          <p v-else>暂无成绩数据</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.statistic-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.statistic-container h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
}

.stat-icon.time-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.score-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.completion-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.chart-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: white;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.chart-content {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 20px;
  padding: 20px;
}

.chart-content p {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260px;
  margin: 0;
  color: #909399;
}

.completion-rate {
  display: flex;
  align-items: center;
  gap: 10px;
}

.completion-rate span {
  width: 60px;
  font-weight: bold;
  color: #333;
}

:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
  font-weight: bold !important;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>