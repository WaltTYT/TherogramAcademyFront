<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElCard, ElTable, ElTableColumn, ElProgress, ElEmpty } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as courseStatisticApi from '../../api/courseStatistic'

const router = useRouter()
const userStore = useUserStore()

// 统计数据
const loading = ref(false)
const overallStats = ref({
  courseCount: 0,
  selectCount: 0,
  completionRate: 0
})

// 完成率排行
const overallCompletionRateRank = ref([])

// 完成率分段统计
const overallCompletionRateSectional = ref([])

// 获取全站统计数据
const getOverallStats = async () => {
  loading.value = true
  try {
    // 获取全站课程数量
    const courseCountResponse = await courseStatisticApi.getOverallCourseCount()
    if (courseCountResponse.data.code === 200) {
      overallStats.value.courseCount = courseCountResponse.data.data
    }
    
    // 获取全站选课人数
    const selectCountResponse = await courseStatisticApi.getOverallSelectCount()
    if (selectCountResponse.data.code === 200) {
      overallStats.value.selectCount = selectCountResponse.data.data
    }
    
    // 获取全站课程完成率平均
    const completionRateResponse = await courseStatisticApi.getOverallCourseCompletionRateAverage()
    if (completionRateResponse.data.code === 200) {
      overallStats.value.completionRate = completionRateResponse.data.data
    }
    
    // 获取全站课程完成率排行
    const rankResponse = await courseStatisticApi.getOverallCourseCompletionRateRank()
    if (rankResponse.data.code === 200) {
      const rankData = rankResponse.data.data
      // 转换Map为数组格式，适配模板
      overallCompletionRateRank.value = Object.entries(rankData).map(([courseName, completionRate]) => ({
        courseName,
        completionRate: parseFloat(completionRate)
      })).sort((a, b) => b.completionRate - a.completionRate)
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
    ElMessage.error('获取全站统计数据失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
    return
  }
  // 获取全站统计数据
  getOverallStats()
})
</script>

<template>
  <div class="course-statistic">
    <div class="header">
      <h2>全站统计</h2>
    </div>
    
    <div class="stats-container">
      <div class="stats-cards">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-title">课程数量</div>
            <div class="stat-value">{{ overallStats.courseCount }}</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-title">选课人数</div>
            <div class="stat-value">{{ overallStats.selectCount }}</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-title">课程完成率</div>
            <div class="stat-value">{{ overallStats.completionRate }}%</div>
            <el-progress 
              :percentage="overallStats.completionRate" 
              :format="() => ''" 
              :stroke-width="15" 
              :color="[
                { color: '#67C23A', percentage: 0 },
                { color: '#F56C6C', percentage: 100 }
              ]"
            />
          </div>
        </el-card>
      </div>
      
      <div class="stats-section">
        <h3>课程完成率排行</h3>
        <el-table :data="overallCompletionRateRank" style="width: 100%" empty-text="暂无数据">
          <el-table-column prop="courseName" label="课程名称" />
          <el-table-column prop="completionRate" label="完成率">
            <template #default="{ row }">
              <div class="completion-rate">
                <span>{{ row.completionRate }}%</span>
                <el-progress 
                  :percentage="row.completionRate" 
                  :format="() => ''" 
                  :stroke-width="8" 
                  :color="[
                    { color: '#67C23A', percentage: 0 },
                    { color: '#F56C6C', percentage: 100 }
                  ]"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
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
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.stat-content {
  padding: 20px;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
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
  gap: 10px;
}

.completion-rate span {
  width: 60px;
  font-weight: bold;
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