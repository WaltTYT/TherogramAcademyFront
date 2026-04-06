<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, User, View, Timer, UserFilled, DataAnalysis } from '@element-plus/icons-vue'
import { 
  getPersonalCourseCount, 
  getPersonalSelectCount, 
  getPersonalCourseCompletionRateAverage, 
  getPersonalCourseCompletionRateRank,
  getOverallCourseCount,
  getOverallSelectCount,
  getOverallCourseCompletionRateAverage,
  getOverallCourseCompletionRateRank
} from '../../api/courseStatistic'
import { 
  teacherUserCount,
  studentUserCount,
  personalStudyTime, 
  personalScoreAverage, 
  personalScoreRank,
  overallStudyTime,
  overallScoreAverage,
  overallScoreRank
} from '../../api/instructionStatistic'

// 统计类型：personal 或 overall
const activeTab = ref('personal')

// 个人统计数据
const personalStats = ref({
  courseCount: 0,
  selectCount: 0,
  completionRate: 0,
  studyTime: 0,
  averageScore: 0
})

// 全站统计数据
const overallStats = ref({
  teacherCount: 0,
  studentCount: 0,
  courseCount: 0,
  selectCount: 0,
  studyTime: 0,
  averageScore: 0,
  completionRate: 0
})

// 排行榜数据
const completionRateRank = ref([])
const scoreRank = ref([])

const loading = ref(false)

// 切换统计类型
const handleTabChange = async (tab) => {
  activeTab.value = tab
  await loadStats()
  await loadRankData()
}

// 加载统计数据
const loadStats = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'personal') {
      // 加载个人统计数据
      const courseCountResponse = await getPersonalCourseCount()
      const selectCountResponse = await getPersonalSelectCount()
      const completionRateResponse = await getPersonalCourseCompletionRateAverage()
      const studyTimeResponse = await personalStudyTime()
      const scoreAverageResponse = await personalScoreAverage()
      
      personalStats.value = {
        courseCount: courseCountResponse.data.data || 0,
        selectCount: selectCountResponse.data.data || 0,
        completionRate: completionRateResponse.data.data || 0,
        studyTime: studyTimeResponse.data.data || 0,
        averageScore: scoreAverageResponse.data.data || 0
      }
    } else {
      // 加载全站统计数据
      const teacherCountResponse = await teacherUserCount()
      const studentCountResponse = await studentUserCount()
      const courseCountResponse = await getOverallCourseCount()
      const selectCountResponse = await getOverallSelectCount()
      const completionRateResponse = await getOverallCourseCompletionRateAverage()
      const studyTimeResponse = await overallStudyTime()
      const scoreAverageResponse = await overallScoreAverage()
      
      overallStats.value = {
        teacherCount: teacherCountResponse.data.data || 0,
        studentCount: studentCountResponse.data.data || 0,
        courseCount: courseCountResponse.data.data || 0,
        selectCount: selectCountResponse.data.data || 0,
        completionRate: completionRateResponse.data.data || 0,
        studyTime: studyTimeResponse.data.data || 0,
        averageScore: scoreAverageResponse.data.data || 0
      }
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
    if (activeTab.value === 'personal') {
      // 加载个人课程完成率排行
      const completionRateRankResponse = await getPersonalCourseCompletionRateRank()
      if (completionRateRankResponse.data.code === 200) {
        const rankData = completionRateRankResponse.data.data
        completionRateRank.value = Object.entries(rankData).map(([name, value]) => ({
          name,
          value: parseFloat(value)
        })).sort((a, b) => b.value - a.value)
      }
      
      // 加载个人成绩排行
      const scoreRankResponse = await personalScoreRank()
      if (scoreRankResponse.data.code === 200) {
        const rankData = scoreRankResponse.data.data
        scoreRank.value = Object.entries(rankData).map(([name, value]) => ({
          name,
          value: parseFloat(value)
        })).sort((a, b) => b.value - a.value)
      }
    } else {
      // 加载全站课程完成率排行
      const completionRateRankResponse = await getOverallCourseCompletionRateRank()
      if (completionRateRankResponse.data.code === 200) {
        const rankData = completionRateRankResponse.data.data
        completionRateRank.value = Object.entries(rankData).map(([name, value]) => ({
          name,
          value: parseFloat(value)
        })).sort((a, b) => b.value - a.value)
      }
      
      // 加载全站成绩排行
      const scoreRankResponse = await overallScoreRank()
      if (scoreRankResponse.data.code === 200) {
        const rankData = scoreRankResponse.data.data
        scoreRank.value = Object.entries(rankData).map(([name, value]) => ({
          name,
          value: parseFloat(value)
        })).sort((a, b) => b.value - a.value)
      }
    }
  } catch (error) {
    ElMessage.error('获取排行榜数据失败：' + (error.message || '未知错误'))
  }
}

onMounted(async () => {
  await loadStats()
  await loadRankData()
})
</script>

<template>
  <div class="statistic-container">
    <h2>教学统计</h2>
    
    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" @tab-click="(tab) => handleTabChange(tab.props.name)" class="stat-tabs">
      <el-tab-pane label="个人统计" name="personal">
        
      </el-tab-pane>
      <el-tab-pane label="全站统计" name="overall">
        
      </el-tab-pane>
    </el-tabs>
    
    <!-- 个人统计 -->
    <div v-if="activeTab === 'personal'" class="stats-section">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon course-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ personalStats.courseCount }}</div>
            <div class="stat-label">课程总数</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon user-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ personalStats.selectCount }}</div>
            <div class="stat-label">选课人数</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon view-icon">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ personalStats.completionRate }}%</div>
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
            <div class="stat-number">{{ personalStats.studyTime }}</div>
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
            <div class="stat-number">{{ personalStats.averageScore }}</div>
            <div class="stat-label">平均成绩</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 全站统计 -->
    <div v-if="activeTab === 'overall'" class="stats-section">
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
    
    <div class="charts-section">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>{{ activeTab === 'personal' ? '个人' : '全站' }}课程完成率排行</span>
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
            <span>{{ activeTab === 'personal' ? '个人' : '全站' }}成绩排行</span>
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

.stat-tabs {
  margin-bottom: 30px;
}

.stat-tabs .el-tabs__header {
  margin-bottom: 20px;
}

.stat-tabs .el-tabs__item {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.stat-tabs .el-tabs__item.is-active {
  color: #409eff;
  font-weight: bold;
}

.stat-tabs .el-tabs__content {
  margin-top: 0;
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
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 20px;
  padding: 20px;
}

.rank-list {
  width: 100%;
  padding: 0;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

.rank-list {
  width: 100%;
  padding: 10px;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
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

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>
