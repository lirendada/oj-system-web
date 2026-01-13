<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getContestList, registerContest } from '@/api/contest'
import { useUserStore } from '@/stores/user'
import { 
  Search, 
  Refresh, 
  Trophy,
  Calendar,
  Timer
} from '@element-plus/icons-vue'
import { 
  type ContestVO, 
  type ContestQueryRequest,
  ContestStatusEnum,
  ContestStatusText 
} from '@/types/global'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const contestList = ref<ContestVO[]>([])

const queryParams = reactive<ContestQueryRequest>({
  current: 1,
  pageSize: 10,
  keyword: ''
})
const total = ref(0)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getContestList(queryParams)
    contestList.value = res.records
    total.value = Number(res.total)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.current = 1
  loadData()
}

const handlePageChange = (page: number) => {
  queryParams.current = page
  loadData()
}

// 核心逻辑：处理点击与报名
const handleAction = async (contest: ContestVO) => {
  // 1. 已结束 -> 直接进入 (查看回顾)
  if (contest.status === ContestStatusEnum.ENDED) {
    router.push(`/contest/${contest.contestId}`)
    return
  }

  // 2. 未登录检查
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  // 3. 未开始 -> 报名逻辑
  if (contest.status === ContestStatusEnum.NOT_STARTED) {
    if (contest.registered) {
      ElMessage.info('您已报名，请耐心等待比赛开始')
      return
    }
    try {
      await ElMessageBox.confirm(`确定要报名参加 "${contest.title}" 吗？`, '报名确认', {
        confirmButtonText: '确定报名',
        cancelButtonText: '再想想',
        type: 'info'
      })
      const success = await registerContest(contest.contestId)
      if (success) {
        ElMessage.success('报名成功！请留意比赛开始时间。')
        loadData() // 刷新状态
      }
    } catch (e) { }
    return
  }

  // 4. 进行中 -> 只有已报名才能进入
  if (contest.status === ContestStatusEnum.IN_PROGRESS) {
    // 如果未报名，进行拦截提示
    if (!contest.registered) {
      ElMessage.warning('您未报名该比赛，无法参加')
      return
    }
    // 已报名，跳转详情页
    router.push(`/contest/${contest.contestId}`)
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case ContestStatusEnum.NOT_STARTED: return 'primary'
    case ContestStatusEnum.IN_PROGRESS: return 'success'
    case ContestStatusEnum.ENDED: return 'info'
    default: return 'info'
  }
}

const getCardClass = (status: number) => {
  if (status === ContestStatusEnum.IN_PROGRESS) return 'contest-card running'
  if (status === ContestStatusEnum.ENDED) return 'contest-card ended'
  return 'contest-card'
}

onMounted(() => {
  // 读取 URL 搜索参数
  if (route.query.keyword) {
    queryParams.keyword = route.query.keyword as string
  }
  loadData()
})

watch(() => route.query.keyword, (newVal) => {
  queryParams.keyword = (newVal as string) || ''
  queryParams.current = 1
  loadData()
})
</script>

<template>
  <div class="contest-list-view">
    <el-card shadow="never" class="filter-card">
      <div class="filter-header">
        <span class="title">竞赛列表</span>
        <div class="search-box">
          <el-input 
            v-model="queryParams.keyword" 
            placeholder="搜索竞赛..." 
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            clearable
            style="width: 240px"
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" circle @click="loadData" />
        </div>
      </div>
    </el-card>

    <div class="contest-container" v-loading="loading">
      <el-empty v-if="contestList.length === 0" description="暂无比赛" />
      
      <div 
        v-else 
        v-for="contest in contestList" 
        :key="contest.contestId"
        :class="getCardClass(contest.status)"
      >
        <div class="card-left">
           <div class="icon-wrapper">
             <el-icon :size="32" color="#fff"><Trophy /></el-icon>
           </div>
           
           <div class="contest-info-wrapper">
              <div class="contest-title-row">
                <h3 class="contest-title" @click="handleAction(contest)">{{ contest.title }}</h3>
                <el-tag :type="getStatusColor(contest.status)" effect="dark" size="small" round>
                  {{ ContestStatusText[contest.status as ContestStatusEnum] }}
                </el-tag>
              </div>
              
              <div class="contest-info">
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>开始时间：{{ contest.startTime }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Timer /></el-icon>
                  <span>时长：{{ contest.duration }}</span>
                </div>
                <div class="info-item" v-if="contest.description">
                   <span class="desc-text">{{ contest.description }}</span>
                </div>
              </div>
           </div>
        </div>

        <div class="card-right">
          
          <template v-if="contest.status === ContestStatusEnum.IN_PROGRESS">
             <div class="status-tip running-tip">比赛正在进行中</div>
             
             <el-button 
               v-if="contest.registered"
               type="success" 
               size="large" 
               round 
               @click="handleAction(contest)"
             >
               立即进入
             </el-button>

             <el-button 
               v-else
               type="info" 
               size="large" 
               round 
               plain
               disabled
               title="比赛已开始，报名已截止"
             >
               未报名
             </el-button>
          </template>

          <template v-else-if="contest.status === ContestStatusEnum.NOT_STARTED">
             <div class="countdown-wrapper">
               <span class="countdown-label">距离开始：</span>
               <el-countdown format="DD天 HH:mm:ss" :value="new Date(contest.startTime).getTime()" value-style="font-size: 14px; color: #409eff; font-weight: 600;" />
             </div>
             
             <el-button 
               v-if="contest.registered" 
               type="primary" 
               size="large" 
               round 
               plain 
               disabled
               style="margin-top: 8px;"
             >
               已报名
             </el-button>
             
             <el-button 
               v-else 
               type="primary" 
               size="large" 
               round 
               @click="handleAction(contest)"
               style="margin-top: 8px;"
             >
               立即报名
             </el-button>
          </template>

          <template v-else>
             <div class="status-tip ended-tip">比赛已结束</div>
             <el-button type="info" plain size="large" round @click="handleAction(contest)">
               查看回顾
             </el-button>
          </template>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.current"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        layout="prev, pager, next"
        background
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.contest-list-view { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
.filter-card { border-radius: 12px; margin-bottom: 24px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); }
.filter-header { display: flex; justify-content: space-between; align-items: center; }
.filter-header .title { font-size: 18px; font-weight: 600; color: #303133; }
.search-box { display: flex; gap: 10px; }

.contest-container { display: flex; flex-direction: column; gap: 20px; min-height: 400px; }
.contest-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}
.contest-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }

.contest-card.running { border-left: 5px solid #67c23a; }
.contest-card.ended { background-color: #fcfcfc; }

.card-left { display: flex; gap: 20px; flex: 1; }
.icon-wrapper {
  width: 60px; height: 60px;
  background: linear-gradient(135deg, #409eff 0%, #a0cfff 100%);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.contest-card.running .icon-wrapper { background: linear-gradient(135deg, #67c23a 0%, #b3e19d 100%); }
.contest-card.ended .icon-wrapper { background: #dcdfe6; }

.contest-info-wrapper { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.contest-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.contest-title { margin: 0; font-size: 18px; font-weight: 600; color: #303133; cursor: pointer; transition: color 0.2s; }
.contest-title:hover { color: #409eff; }

.contest-info { display: flex; gap: 20px; color: #606266; font-size: 13px; flex-wrap: wrap; }
.info-item { display: flex; align-items: center; gap: 5px; }
.desc-text { color: #909399; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.card-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; min-width: 150px; }
.status-tip { font-size: 14px; margin-bottom: 8px; font-weight: 500; }
.running-tip { color: #67c23a; }
.ended-tip { color: #909399; }
.countdown-wrapper { margin-bottom: 8px; display: flex; align-items: center; font-size: 13px; color: #606266; }

.pagination-container { margin-top: 30px; display: flex; justify-content: center; }
</style>