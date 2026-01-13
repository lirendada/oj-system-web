<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  getContestDetail, 
  getContestProblemList, 
  getContestRank, 
  registerContest 
} from '@/api/contest'
import { useUserStore } from '@/stores/user'
import { 
  ElMessage, 
  ElMessageBox 
} from 'element-plus'
import { 
  Calendar, 
  Timer, 
  Trophy, 
  List, 
  Lock,
  Refresh // ✅ 新增引用
} from '@element-plus/icons-vue'
import { 
  type ContestVO, 
  type ContestProblemVO, 
  type ContestRankVO,
  ContestStatusEnum 
} from '@/types/global'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// ✅ 新增：默认头像常量
const DEFAULT_AVATAR = 'https://p.ssl.qhimg.com/sdm/480_480_/t01520a1bd1802ae864.jpg'

const contestId = route.params.id as string
const loading = ref(false)
// ✅ 新增：榜单加载状态，用于控制刷新按钮动画
const rankLoading = ref(false)

const contest = ref<ContestVO>()

// 数据列表
const problemList = ref<ContestProblemVO[]>([])
const rankList = ref<ContestRankVO[]>([])

// 倒计时
const timeLeft = ref('')
let timer: any = null

// 加载比赛详情
const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getContestDetail(contestId)
    contest.value = res
    
    // 如果比赛进行中或已结束，加载题目和排行榜
    if (res.status !== ContestStatusEnum.NOT_STARTED) {
      loadProblems()
      loadRank()
    }
    
    // 启动倒计时
    if (res.status === ContestStatusEnum.NOT_STARTED || res.status === ContestStatusEnum.IN_PROGRESS) {
      startTimer()
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadProblems = async () => {
  try {
    const res = await getContestProblemList(contestId)
    problemList.value = res
  } catch (error) {
    console.error(error)
  }
}

// ✅ 优化：加载排行榜逻辑，增加 loading 动画效果
const loadRank = async () => {
  if (rankLoading.value) return // 防止重复点击
  rankLoading.value = true
  try {
    const res = await getContestRank(contestId)
    rankList.value = res
    // 加个小提示，体验更好
    // if (!loading.value) { // 页面初次加载时不提示
    //    ElMessage.success({ message: '榜单已更新', grouping: true, duration: 1500 })
    // }
  } catch (error) {
    console.error(error)
  } finally {
    // 强制延迟 500ms，让旋转动画展示一会，避免闪烁
    setTimeout(() => {
      rankLoading.value = false
    }, 500)
  }
}

// 报名逻辑
const handleRegister = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    await ElMessageBox.confirm('确定要报名参加该比赛吗？', '报名确认', { type: 'info' })
    await registerContest(contestId)
    ElMessage.success('报名成功')
    loadDetail() // 刷新状态
  } catch (e) {
    // cancelled
  }
}

// 点击题目
const handleProblemClick = (problem: ContestProblemVO) => {
  if (contest.value?.status === ContestStatusEnum.ENDED) {
    ElMessage.warning('比赛已结束，无法提交代码')
    return
  }
  // 携带 contestId 跳转，方便后续提交时关联比赛
  router.push({
    path: `/problem/detail/${problem.problemId}`,
    query: { contestId: contestId }
  })
}

// 倒计时逻辑
const startTimer = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (!contest.value) return
    const now = new Date().getTime()
    const start = new Date(contest.value.startTime).getTime()
    const end = new Date(contest.value.endTime).getTime()
    
    let diff = 0
    let prefix = ''
    
    if (now < start) {
      diff = start - now
      prefix = '距离开始还有：'
    } else if (now < end) {
      diff = end - now
      prefix = '距离结束还有：'
    } else {
      timeLeft.value = '比赛已结束'
      clearInterval(timer)
      return
    }
    
    const h = Math.floor(diff / (1000 * 60 * 60))
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const s = Math.floor((diff % (1000 * 60)) / 1000)
    timeLeft.value = `${prefix} ${h}小时 ${m}分 ${s}秒`
  }, 1000)
}

// 根据排名获取颜色
const getRankColor = (index: number) => {
  if (index === 0) return '#f56c6c' // Gold
  if (index === 1) return '#e6a23c' // Silver
  if (index === 2) return '#409eff' // Bronze
  return '#606266'
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="contest-detail-view" v-loading="loading">
    <el-card shadow="never" class="header-card">
      <div class="contest-header">
        <div class="header-left">
          <el-tag 
            v-if="contest"
            :type="contest.status === ContestStatusEnum.IN_PROGRESS ? 'success' : (contest.status === ContestStatusEnum.NOT_STARTED ? 'primary' : 'info')"
            effect="dark"
            size="large"
            class="status-tag"
          >
            {{ contest?.statusDesc }}
          </el-tag>
          <h1 class="title">{{ contest?.title }}</h1>
        </div>
        <div class="header-right">
          <div class="time-info">
            <p><el-icon><Calendar /></el-icon> 开始：{{ contest?.startTime }}</p>
            <p><el-icon><Timer /></el-icon> 时长：{{ contest?.duration }}</p>
          </div>
        </div>
      </div>
      
      <div class="contest-desc" v-if="contest?.description">
        {{ contest.description }}
      </div>

      <div class="status-bar" v-if="timeLeft">
        <el-alert :title="timeLeft" type="warning" :closable="false" center show-icon />
      </div>
    </el-card>

    <div class="contest-body">
      <div v-if="contest?.status === ContestStatusEnum.NOT_STARTED" class="not-started-panel">
        <el-empty description="比赛尚未开始" :image-size="160">
          <template #default>
            <p class="wait-text">请耐心等待比赛开始，报名后即可参赛</p>
            <el-button type="primary" size="large" @click="handleRegister" round>
              立即报名
            </el-button>
          </template>
        </el-empty>
      </div>

      <el-card v-else shadow="never" class="tab-card">
        <el-row :gutter="20">
          <el-col :xs="24" :md="10">
            <el-card shadow="never" class="panel-card">
              <template #header>
                <div class="panel-header">
                  <span class="panel-title"><el-icon><List /></el-icon> 题目列表</span>
                </div>
              </template>
              
              <el-table :data="problemList" stripe style="width: 100%" :show-header="true">
                <el-table-column label="序号" width="60" align="center">
                  <template #default="{ row }">
                    <span class="problem-index">{{ row.displayId }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="题目名称">
                  <template #default="{ row }">
                    <div 
                      class="problem-title" 
                      :class="{ 'disabled': contest.status === ContestStatusEnum.ENDED }"
                      @click="handleProblemClick(row)"
                    >
                      <span class="title-text">{{ row.title }}</span>
                      <el-icon v-if="contest.status === ContestStatusEnum.ENDED" class="lock-icon"><Lock /></el-icon>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <el-col :xs="24" :md="14">
            <el-card shadow="never" class="panel-card">
              <template #header>
                <div class="panel-header">
                  <span class="panel-title"><el-icon><Trophy /></el-icon> 实时榜单</span>
                  
                  <el-button 
                    type="primary" 
                    link 
                    size="small" 
                    @click="loadRank" 
                    class="refresh-btn"
                  >
                    <el-icon 
                      class="refresh-icon" 
                      :class="{ 'is-spinning': rankLoading }"
                    >
                      <Refresh />
                    </el-icon>
                    <span style="margin-left: 4px">刷新</span>
                  </el-button>

                </div>
              </template>

              <el-table :data="rankList" style="width: 100%" height="600">
                <el-table-column label="排名" width="70" align="center" fixed>
                  <template #default="{ $index }">
                    <span :style="{ color: getRankColor($index), fontWeight: 'bold' }">
                      {{ $index + 1 }}
                    </span>
                  </template>
                </el-table-column>
                
                <el-table-column label="选手" width="160" fixed>
                  <template #default="{ row }">
                    <div class="rank-user">
                      <el-avatar :size="24" :src="row.avatar || DEFAULT_AVATAR" class="rank-avatar">
                        {{ row.nickname?.charAt(0)?.toUpperCase() }}
                      </el-avatar>
                      <span class="rank-nickname" :title="row.nickname">{{ row.nickname }}</span>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column prop="totalScore" label="总分" width="80" align="center" fixed>
                  <template #default="{ row }">
                    <span style="font-weight: bold; color: #409eff">{{ row.totalScore }}</span>
                  </template>
                </el-table-column>

                <el-table-column 
                  v-for="problem in problemList" 
                  :key="problem.id"
                  :label="problem.displayId"
                  align="center"
                  min-width="60"
                >
                  <template #default="{ row }">
                    <span 
                      v-if="row.problemScores && row.problemScores[problem.problemId]" 
                      class="score-cell"
                      :class="{ 'score-ac': row.problemScores[problem.problemId] === 100 }"
                    >
                      {{ row.problemScores[problem.problemId] }}
                    </span>
                    <span v-else class="score-cell score-zero">-</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.panel-card {
  height: 100%;
  border-radius: 8px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.contest-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 头部样式 */
.header-card {
  margin-bottom: 20px;
  border-radius: 12px;
  background: linear-gradient(to right, #ffffff, #f9f9f9);
}
.contest-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.title {
  font-size: 24px;
  margin: 0;
  color: #303133;
}
.time-info p {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  margin: 5px 0;
  font-size: 14px;
}
.contest-desc {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
  background: #f4f4f5;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
}
.status-bar {
  margin-top: 10px;
}

/* 未开始面板 */
.not-started-panel {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
}
.wait-text {
  color: #909399;
  margin-bottom: 20px;
}

/* Tab 样式 */
.tab-card {
  border-radius: 12px;
  min-height: 500px;
}

/* 题目列表样式 */
.problem-index {
  font-weight: bold;
  color: #909399;
}
.problem-title {
  color: #303133;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}
.problem-title:hover {
  color: #409eff;
}
.problem-title.disabled {
  color: #a8abb2;
  cursor: not-allowed;
}
.problem-title.disabled:hover {
  color: #a8abb2;
}

/* 排行榜样式 */
.rank-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rank-nickname {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.score-cell {
  font-weight: 500;
}
.score-ac {
  color: #67c23a;
  font-weight: bold;
}
.score-zero {
  color: #dcdfe6;
}

/* ✅ 新增：刷新按钮及动画样式 */
.refresh-btn {
  font-weight: normal;
  transition: all 0.3s;
}
.refresh-btn:hover {
  color: #409eff;
}
.refresh-icon {
  font-size: 16px;
  transition: transform 0.5s ease;
}
/* 旋转动画 */
.is-spinning {
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>