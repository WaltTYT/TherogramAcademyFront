<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Timer, DataAnalysis, Check } from '@element-plus/icons-vue'
import { getPersonalCourseCompletionRateAverage, getPersonalCourseCompletionRateRank, getPersonalCourseCompletionRateSectional } from '../../api/courseStatistic'
import { personalStudyTime, personalScoreAverage, personalScoreRank, personalScoreSectional } from '../../api/instructionStatistic'

const studyStats = ref({
  studyTime: 0,
  averageScore: 0,
  completionRate: 0
})

const loading = ref(false)

const loadStudyStats = async () => {
  loading.value = true
  try {
    // 加载学习统计数据
    const studyTimeResponse = await personalStudyTime()
    const scoreAverageResponse = await personalScoreAverage()
    const completionRateResponse = await getPersonalCourseCompletionRateAverage()
    
    studyStats.value = {
      studyTime: studyTimeResponse.data,
      averageScore: scoreAverageResponse.data,
      completionRate: completionRateResponse.data
    }
  } catch (error) {
    ElMessage.error('获取学习统计数据失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadStudyStats()
})
</script>

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
          <p>课程完成率排行榜将在这里显示</p>
        </div>
      </el-card>
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>成绩排行</span>
          </div>
        </template>
        <div class="chart-content">
          <p>成绩排行榜将在这里显示</p>
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
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 20px;
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