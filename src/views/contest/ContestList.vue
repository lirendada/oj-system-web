<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getContestList, registerContest } from '@/api/contest'
import { Search, Trophy, Timer, Calendar, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

// ✅ 修改引用路径为 @/types/global
import { 
  type ContestVO, 
  type ContestQueryRequest, 
  ContestStatusEnum, 
  ContestStatusText 
} from '@/types/global'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const contestList = ref<ContestVO[]>([])
const total = ref(0)

const queryParams = reactive<ContestQueryRequest>({
  current: 1,
  pageSize: 10,
  keyword: '',
  status: undefined
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getContestList(queryParams)
    contestList.value = res.records
    total.value = res.total
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

const handleAction = async (contest: ContestVO) => {
  // 1. ✅ 修复：已结束的比赛，直接跳转详情页 (查看榜单/题目)
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

  // 3. 未开始
  if (contest.status === ContestStatusEnum.NOT_STARTED) {
    // ✅ 新增：如果已报名，提示并阻断
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
        // 刷新列表以更新按钮状态
        loadData()
      }
    } catch (e) { }
    return
  }

  // 4. 进行中
  if (contest.status === ContestStatusEnum.IN_PROGRESS) {
    // 直接进入详情页，权限由后端/详情页逻辑控制
    router.push(`/contest/${contest.contestId}`)
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case ContestStatusEnum.NOT_STARTED: return 'primary'
    case ContestStatusEnum.IN_PROGRESS: return 'success' // 注意枚举名
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
  // 1. 读取 URL 上的搜索参数
  if (route.query.keyword) {
    queryParams.keyword = route.query.keyword as string
  }
  // 2. 必须调用 loadData()，而不是 getContestList()
  // loadData 内部写了 getContestList(queryParams)，这样才会带上参数
  loadData() 
})

watch(() => route.query.keyword, (newVal) => {
  queryParams.keyword = (newVal as string) || ''
  queryParams.current = 1 // 搜索时重置回第一页
  loadData() // 同样调用 loadData
})
</script>

<template>
  <div class="contest-list-view">
    <el-card shadow="never" class="filter-card">
      <div class="filter-header">
        <div class="title">
          <el-icon :size="22" color="#409eff"><Trophy /></el-icon>
          <span>竞赛中心</span>
        </div>
        <div class="filter-actions">
          <el-input 
            v-model="queryParams.keyword" 
            placeholder="搜索比赛名称" 
            :prefix-icon="Search"
            clearable 
            @keyup.enter="handleSearch"
            style="width: 240px; margin-right: 12px"
          />
          <el-select 
            v-model="queryParams.status" 
            placeholder="比赛状态" 
            clearable 
            style="width: 140px; margin-right: 12px"
            @change="handleSearch"
          >
            <el-option label="未开始" :value="ContestStatusEnum.NOT_STARTED" />
            <el-option label="进行中" :value="ContestStatusEnum.IN_PROGRESS" />
            <el-option label="已结束" :value="ContestStatusEnum.ENDED" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
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

        <div class="card-right">
          <template v-if="contest.status === ContestStatusEnum.IN_PROGRESS">
             <div class="status-tip running-tip">比赛正在进行中</div>
             <el-button type="success" size="large" round @click="handleAction(contest)">
               立即进入
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
        :page-sizes="[10, 20]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="handlePageChange"
        background
      />
    </div>
  </div>
</template>

<style scoped>
/* 样式保持不变 */
.contest-list-view { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.filter-card { margin-bottom: 24px; border-radius: 12px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }
.filter-header { display: flex; justify-content: space-between; align-items: center; }
.title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; color: #303133; }
.filter-actions { display: flex; align-items: center; }
.contest-container { display: flex; flex-direction: column; gap: 16px; min-height: 400px; }
.contest-card { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 24px 30px; border-radius: 12px; border: 1px solid #ebeef5; transition: all 0.3s ease; position: relative; overflow: hidden; }
.contest-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
.contest-card.running { border-left: 5px solid #67c23a; background: linear-gradient(to right, #f0f9eb 0%, #ffffff 30%); }
.contest-card.ended { background-color: #fcfcfc; opacity: 0.9; }
.contest-card.ended .contest-title { color: #909399; }
.card-left { flex: 1; }
.contest-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.contest-title { font-size: 20px; font-weight: 600; color: #303133; margin: 0; cursor: pointer; transition: color 0.2s; }
.contest-title:hover { color: #409eff; }
.contest-info { display: flex; flex-wrap: wrap; gap: 24px; color: #606266; font-size: 14px; }
.info-item { display: flex; align-items: center; gap: 6px; }
.desc-text { color: #909399; max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-width: 140px; }
.status-tip { font-size: 13px; font-weight: 500; }
.running-tip { color: #67c23a; }
.future-tip { color: #409eff; display: flex; align-items: center; gap: 4px; }
.ended-tip { color: #909399; }
.pagination-container { margin-top: 30px; display: flex; justify-content: flex-end; padding-bottom: 40px; }
</style>