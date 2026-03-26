<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElCard, ElTable, ElTableColumn, ElProgress, ElTabs, ElTabPane, ElEmpty } from 'element-plus'
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
const personalStats = ref({
  courseCount: 0,
  selectCount: 0,
  completionRate: 0
})

// 完成率排行
const overallCompletionRateRank = ref([])
const personalCompletionRateRank = ref([])

// 完成率分段统计
const overallCompletionRateSectional = ref([])
const personalCompletionRateSectional = ref([])

// 标签页
const activeTab = ref('overall')

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
      overallCompletionRateRank.value = rankResponse.data.data
    }
    
    // 获取全站课程完成率分段统计
    const sectionalResponse = await courseStatisticApi.getOverallCourseCompletionRateSectional()
    if (sectionalResponse.data.code === 200) {
      overallCompletionRateSectional.value = sectionalResponse.data.data
    }
  } catch (error) {
    ElMessage.error('获取全站统计数据失败')
  } finally {
    loading.value = false
  }
}

// 获取个人统计数据
const getPersonalStats = async () => {
  loading.value = true
  try {
    // 获取个人课程数量
    const courseCountResponse = await courseStatisticApi.getPersonalCourseCount()
    if (courseCountResponse.data.code === 200) {
      personalStats.value.courseCount = courseCountResponse.data.data
    }
    
    // 获取个人选课人数
    const selectCountResponse = await courseStatisticApi.getPersonalSelectCount()
    if (selectCountResponse.data.code === 200) {
      personalStats.value.selectCount = selectCountResponse.data.data
    }
    
    // 获取个人课程完成率平均
    const completionRateResponse = await courseStatisticApi.getPersonalCourseCompletionRateAverage()
    if (completionRateResponse.data.code === 200) {
      personalStats.value.completionRate = completionRateResponse.data.data
    }
    
    // 获取个人课程完成率排行
    const rankResponse = await courseStatisticApi.getPersonalCourseCompletionRateRank()
    if (rankResponse.data.code === 200) {
      personalCompletionRateRank.value = rankResponse.data.data
    }
    
    // 获取个人课程完成率分段统计
    const sectionalResponse = await courseStatisticApi.getPersonalCourseCompletionRateSectional()
    if (sectionalResponse.data.code === 200) {
      personalCompletionRateSectional.value = sectionalResponse.data.data
    }
  } catch (error) {
    ElMessage.error('获取个人统计数据失败')
  } finally {
    loading.value = false
  }
}

// 标签页切换
const handleTabChange = (tab) => {
  activeTab.value = tab.paneName
  if (tab.paneName === 'personal') {
    getPersonalStats()
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
      <h2>课程统计</h2>
    </div>
    
    <el-tabs v-model="activeTab" @tab-click="(tab) => handleTabChange(tab.paneName)" class="stats-tabs">
      <!-- 全站统计 -->
      <el-tab-pane label="全站统计" name="overall">
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
      </el-tab-pane>
      
      <!-- 个人统计 -->
      <el-tab-pane label="个人统计" name="personal">
        <div class="stats-cards">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-title">课程数量</div>
              <div class="stat-value">{{ personalStats.courseCount }}</div>
            </div>
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-title">选课人数</div>
              <div class="stat-value">{{ personalStats.selectCount }}</div>
            </div>
          </el-card>
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-title">课程完成率</div>
              <div class="stat-value">{{ personalStats.completionRate }}%</div>
              <el-progress 
                :percentage="personalStats.completionRate" 
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
          <el-table :data="personalCompletionRateRank" style="width: 100%" empty-text="暂无数据">
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
            <div v-for="item in personalCompletionRateSectional" :key="item.range" class="sectional-item">
              <div class="sectional-label">{{ item.range }}</div>
              <div class="sectional-bar">
                <div 
                  class="sectional-fill" 
                  :style="{ width: item.ratio + '%' }"
                ></div>
              </div>
              <div class="sectional-value">{{ item.count }} 门课程</div>
            </div>
            <el-empty v-if="personalCompletionRateSectional.length === 0" description="暂无数据" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
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

.stats-tabs {
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
  
  .stats-tabs {
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