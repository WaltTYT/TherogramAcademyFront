<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElCard, ElTable, ElTableColumn, ElProgress, ElEmpty } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { Document, User, View, Timer, UserFilled, DataAnalysis } from '@element-plus/icons-vue'
import * as courseStatisticApi from '../../api/courseStatistic'
import * as instructionStatisticApi from '../../api/instructionStatistic'

const router = useRouter()
const userStore = useUserStore()

// 全站统计数据
const overallStats = ref({
  teacherCount: 0,
  studentCount: 0,
  courseCount: 0,
  selectCount: 0,
  completionRate: 0,
  studyTime: 0,
  averageScore: 0
})

// 完成率排行
const completionRateRank = ref([])
const scoreRank = ref([])

// 完成率分段统计
const overallCompletionRateSectional = ref([])

const loading = ref(false)

// 加载统计数据
const loadStats = async () => {
  loading.value = true
  try {
    // 加载全站统计数据
    const teacherCountResponse = await instructionStatisticApi.teacherUserCount()
    const studentCountResponse = await instructionStatisticApi.studentUserCount()
    const courseCountResponse = await courseStatisticApi.getOverallCourseCount()
    const selectCountResponse = await courseStatisticApi.getOverallSelectCount()
    const completionRateResponse = await courseStatisticApi.getOverallCourseCompletionRateAverage()
    const studyTimeResponse = await instructionStatisticApi.overallStudyTime()
    const scoreAverageResponse = await instructionStatisticApi.overallScoreAverage()
    
    overallStats.value = {
      teacherCount: teacherCountResponse.data.data || 0,
      studentCount: studentCountResponse.data.data || 0,
      courseCount: courseCountResponse.data.data || 0,
      selectCount: selectCountResponse.data.data || 0,
      completionRate: completionRateResponse.data.data || 0,
      studyTime: studyTimeResponse.data.data || 0,
      averageScore: scoreAverageResponse.data.data || 0
    }
    
    // 获取全站课程完成率分段统计
    const sectionalResponse = await courseStatisticApi.getOverallCourseCompletionRateSectional()
    if (sectionalResponse.data.code === 200) {
      const sectionalData = sectionalResponse.data.data
      // 转换List<Integer>为数组格式，适配模板
      const ranges = ['0~20%', '21~40%', '41~60%', '61~80%', '81~100%']
      overallCompletionRateSectional.value = ranges.map((range, index) => ({
        range,
        count: sectionalData[index] || 0,
        ratio: sectionalData[index] ? Math.round((sectionalData[index] / sectionalData.reduce((a, b) => a + b, 0)) * 100) : 0
      })).filter(item => item.count > 0)
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 加载排行榜数据
const loadRankData = async () => {
  try {
    // 加载全站课程完成率排行
    const completionRateRankResponse = await courseStatisticApi.getOverallCourseCompletionRateRank()
    if (completionRateRankResponse.data.code === 200) {
      const rankData = completionRateRankResponse.data.data
      completionRateRank.value = Object.entries(rankData).map(([name, value]) => ({
        name,
        value: parseFloat(value)
      })).sort((a, b) => b.value - a.value)
    }
    
    // 加载全站成绩排行
    const scoreRankResponse = await instructionStatisticApi.overallScoreRank()
    if (scoreRankResponse.data.code === 200) {
      const rankData = scoreRankResponse.data.data
      scoreRank.value = Object.entries(rankData).map(([name, value]) => ({
        name,
        value: parseFloat(value)
      })).sort((a, b) => b.value - a.value)
    }
  } catch (error) {
    ElMessage.error('获取排行榜数据失败：' + (error.message || '未知错误'))
  }
}

// 生命周期
onMounted(async () => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 获取统计数据
  await loadStats()
  await loadRankData()
})
</script>

<template>
  <div class="course-statistic">
    <div class="header">
      <h2>统计分析</h2>
    </div>
    
    <div class="stats-container">
      <!-- 全站统计 -->
      <div class="stats-section">
        <div class="stats-cards">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon teacher-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.teacherCount }}</div>
                <div class="stat-label">教师数量</div>
              </div>
            </div>
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon student-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.studentCount }}</div>
                <div class="stat-label">学生数量</div>
              </div>
            </div>
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon course-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.courseCount }}</div>
                <div class="stat-label">课程数量</div>
              </div>
            </div>
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon select-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.selectCount }}</div>
                <div class="stat-label">选课人数</div>
              </div>
            </div>
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon completion-icon">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.completionRate }}%</div>
                <div class="stat-label">课程完成率</div>
              </div>
            </div>
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon time-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.studyTime }}</div>
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
                <div class="stat-number">{{ overallStats.averageScore }}</div>
                <div class="stat-label">平均成绩</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <div class="charts-section">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>全站课程完成率排行</span>
            </div>
          </template>
          <div class="chart-content">
            <div v-if="completionRateRank.length === 0" class="empty-text">
              <p>暂无课程完成率排行数据</p>
            </div>
            <div v-else class="rank-list">
              <div v-for="(item, index) in completionRateRank" :key="index" class="rank-item">
                <span class="rank-index" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</span>
                <span class="rank-name">{{ item.name }}</span>
                <span class="rank-value">{{ item.value }}%</span>
                <el-progress :percentage="item.value" :stroke-width="8" :show-text="false" class="rank-progress" />
              </div>
            </div>
          </div>
        </el-card>
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>全站成绩排行</span>
            </div>
          </template>
          <div class="chart-content">
            <div v-if="scoreRank.length === 0" class="empty-text">
              <p>暂无成绩排行数据</p>
            </div>
            <div v-else class="rank-list">
              <div v-for="(item, index) in scoreRank" :key="index" class="rank-item">
                <span class="rank-index" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</span>
                <span class="rank-name">{{ item.name }}</span>
                <span class="rank-value">{{ item.value }}</span>
                <el-progress :percentage="Math.min(item.value, 100)" :stroke-width="8" :show-text="false" class="rank-progress" />
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 全站课程完成率分段统计 -->
      <div class="stats-section">
        <h3>课程完成率分段统计</h3>
        <div class="sectional-stats">
          <div v-for="item in overallCompletionRateSectional" :key="item.range" class="sectional-item">
            <div class="sectional-label">{{ item.range }}</div>
            <div class="sectional-bar">
              <div 
                class="sectional-fill" 
                :style="{ width: item.ratio + '%' }"
              ></div>
            </div>
            <div class="sectional-value">{{ item.count }} 门课程</div>
          </div>
          <el-empty v-if="overallCompletionRateSectional.length === 0" description="暂无数据" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-statistic {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.stats-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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

.stat-icon.course-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.user-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.view-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-icon.teacher-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.student-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.select-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-icon.completion-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.time-icon {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
}

.stat-icon.score-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
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

.stats-section {
  margin-bottom: 30px;
  display: block;
}

.stats-section h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.completion-rate {
  display: flex;
  align-items: center;
  gap: 15px;
  white-space: nowrap;
  justify-content: flex-start;
}

.completion-rate span {
  width: 70px;
  font-weight: bold;
  text-align: left;
  flex-shrink: 0;
}

.completion-rate .el-progress {
  flex: 1;
  min-width: 150px;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
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
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 20px;
  padding: 20px;
  overflow: visible;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

.rank-list {
  width: 100%;
  padding: 0;
  overflow: visible;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
  overflow: visible;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #909399;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.rank-index.top-three {
  background: #f56c6c;
}

.rank-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12px;
}

.rank-value {
  width: 60px;
  text-align: right;
  font-size: 14px;
  font-weight: bold;
  color: #409eff;
  margin-right: 12px;
  flex-shrink: 0;
}

.rank-progress {
  width: 100px;
  flex-shrink: 0;
}

.sectional-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.sectional-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sectional-label {
  width: 100px;
  font-size: 14px;
  color: #666;
}

.sectional-bar {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.sectional-fill {
  height: 100%;
  background: linear-gradient(90deg, #67C23A, #F56C6C);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.sectional-value {
  width: 120px;
  font-size: 14px;
  color: #666;
  text-align: right;
}

@media (max-width: 768px) {
  .course-statistic {
    padding: 10px;
  }
  
  .stats-container {
    padding: 10px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .sectional-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .sectional-label {
    width: 100%;
  }
  
  .sectional-value {
    width: 100%;
    text-align: left;
  }
}
</style>