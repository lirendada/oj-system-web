<script setup lang="ts">
import { onMounted, reactive, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getProblemList, getRankList } from '@/api/problem'
import { useUserStore } from '@/stores/user' 
import { Search, Refresh, Trophy } from '@element-plus/icons-vue'
import { 
  type ProblemVO, 
  type ProblemQueryRequest, 
  type RankItemVO,
  DifficultyEnum, 
  DifficultyText 
} from '@/types/global'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const tableData = ref<ProblemVO[]>([])
const total = ref(0)

const DEFAULT_AVATAR = 'https://p.ssl.qhimg.com/sdm/480_480_/t01520a1bd1802ae864.jpg'

// ✅ 核心修复：安全获取当前用户 ID
// 使用 computed 缓存，并添加多重空值检查，防止页面一加载就报错
const currentUserId = computed(() => {
  const info = userStore.userInfo
  if (!info) return null
  // 兼容两种结构：直接在 info 里，或者在 info.user 里
  return info.userId || (info.user && info.user.userId) || null
})

// 排行榜相关状态
const rankLoading = ref(false)
const rankList = ref<RankItemVO[]>([])
const activeRankTab = ref<'day' | 'week' | 'month' | 'total'>('total')

const queryParams = reactive<ProblemQueryRequest>({
  current: 1,
  pageSize: 10,
  keyword: '',
  difficulty: undefined,
  sortField: undefined, 
  sortOrder: undefined 
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getProblemList(queryParams)
    // ✅ res.data 才是真正的数据
    const data = res?.data
    tableData.value = data?.records || []
    total.value = Number(data?.total || 0)
  } catch (error) {
    console.error(error)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const loadRankData = async () => {
  rankLoading.value = true
  try {
    const typeMap: Record<string, 'daily' | 'weekly' | 'monthly' | 'total'> = {
      day: 'daily',
      week: 'weekly',
      month: 'monthly',
      total: 'total'
    }
    const res = await getRankList(typeMap[activeRankTab.value])
    // ✅ res.data 才是真正的数组
    const dataList = res?.data || []
    // 过滤掉 null 或无效的排行榜数据
    rankList.value = dataList.filter((item: any) => item && item.userId)
  } catch (error) {
    console.error('获取排行榜失败', error)
    rankList.value = [] // 出错时清空数据
  } finally {
    rankLoading.value = false
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

const toDetail = (problemId: string) => {
  router.push(`/problem/detail/${problemId}`)
}

const getDifficultyColor = (diff: number) => {
  switch (diff) {
    case DifficultyEnum.EASY: return 'success'
    case DifficultyEnum.MEDIUM: return 'warning'
    case DifficultyEnum.HARD: return 'danger'
    default: return 'info'
  }
}

const getRankIndexColor = (index: number) => {
  if (index === 0) return '#f56c6c' // 金
  if (index === 1) return '#e6a23c' // 银
  if (index === 2) return '#409eff' // 铜
  return '#909399'
}

const getRankCountText = () => {
  switch (activeRankTab.value) {
    case 'day': return '今日通过'
    case 'week': return '本周通过'
    case 'month': return '本月通过'
    case 'total': return '累计通过'
    default: return '已通过'
  }
}

const handleSortChange = ({ prop, order }: { prop: string, order: string }) => {
  if (!order) {
    queryParams.sortField = undefined
    queryParams.sortOrder = undefined
  } else {
    queryParams.sortField = prop
    queryParams.sortOrder = order === 'ascending' ? 'ascend' : 'descend'
  }
  queryParams.current = 1
  loadData()
}

onMounted(() => {
  if (route.query.keyword) {
    queryParams.keyword = route.query.keyword as string
  }
  loadData()
  loadRankData()
})

watch(() => route.query.keyword, (newVal) => {
  queryParams.keyword = (newVal as string) || ''
  queryParams.current = 1
  loadData()
})
</script>

<template>
  <div class="problem-list-view">
    <el-row :gutter="20">
      <el-col :span="18" :xs="24">
        <el-card shadow="never" class="list-card search-card">
          <el-form :inline="true" :model="queryParams">
            <el-form-item label="关键词">
              <el-input 
                v-model="queryParams.keyword" 
                placeholder="输入题目名称" 
                clearable 
                @keyup.enter="handleSearch"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="难度">
              <el-select v-model="queryParams.difficulty" placeholder="全部" clearable style="width: 120px">
                <el-option 
                  v-for="(label, value) in DifficultyText" 
                  :key="value" 
                  :label="label" 
                  :value="Number(value)" 
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch" round>搜索</el-button>
              <el-button :icon="Refresh" @click="loadData" circle></el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" class="list-card table-card">
          <el-table 
            :data="tableData" 
            v-loading="loading" 
            stripe 
            style="width: 100%"
            @sort-change="handleSortChange" 
          >
            <el-table-column prop="problemId" label="ID" width="180" />
            
            <el-table-column label="题目名称" min-width="200">
              <template #default="{ row }">
                <el-link type="primary" @click="toDetail(row.problemId)" style="font-weight: 500;">
                  {{ row.title }}
                </el-link>
                <span v-if="row.tags && row.tags.length" style="margin-left: 10px">
                  <el-tag 
                    v-for="tag in row.tags" 
                    :key="tag.tagId" 
                    size="small" 
                    type="info" 
                    effect="light" 
                    class="tag-item"
                    round
                  >
                    {{ tag.tagName }}
                  </el-tag>
                </span>
              </template>
            </el-table-column>

            <el-table-column label="难度" width="100" prop="difficulty" sortable="custom">
              <template #default="{ row }">
                <el-tag :type="getDifficultyColor(row.difficulty)" effect="dark" round size="small">
                  {{ DifficultyText[row.difficulty as DifficultyEnum] || '未知' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="通过率" width="120" prop="rate" sortable="custom">
              <template #default="{ row }">
                <span style="color: #606266;">
                  {{ row.submitNum > 0 ? ((row.acceptedNum / row.submitNum) * 100).toFixed(1) + '%' : '0.0%' }}
                </span>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="queryParams.current"
              v-model:page-size="queryParams.pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadData"
              @current-change="handlePageChange"
              background
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="6" :xs="24" class="hidden-xs-only">
        <el-card shadow="never" class="list-card rank-card">
          <template #header>
            <div class="rank-header">
              <span style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 16px;">
                <el-icon color="#f56c6c" :size="20"><Trophy /></el-icon> 刷题榜
              </span>
            </div>
          </template>
          
          <el-tabs v-model="activeRankTab" @tab-change="loadRankData" class="rank-tabs" stretch>
            <el-tab-pane label="日榜" name="day"></el-tab-pane>
            <el-tab-pane label="周榜" name="week"></el-tab-pane>
            <el-tab-pane label="月榜" name="month"></el-tab-pane>
            <el-tab-pane label="总榜" name="total"></el-tab-pane>
          </el-tabs>

          <div class="rank-list" v-loading="rankLoading">
            <div v-if="rankList.length === 0" class="empty-rank">
              <el-empty description="暂无上榜数据" :image-size="60" />
            </div>
            <div
              v-else
              v-for="(item, index) in rankList"
              :key="item?.userId"
              class="rank-item"
              :class="{ 'my-rank': currentUserId && item?.userId === currentUserId }"
            >
              <div class="rank-index" :style="{ color: getRankIndexColor(index), fontWeight: index < 3 ? 'bold' : 'normal' }">
                {{ index + 1 }}
              </div>
              <div class="rank-user">
                <el-avatar :size="32" :src="item?.avatar || DEFAULT_AVATAR" class="user-avatar">
                   {{ item?.nickname?.charAt(0)?.toUpperCase() }}
                </el-avatar>
                <div class="user-info">
                   <div class="nickname" :title="item?.nickname">{{ item?.nickname }}</div>
                   <div class="desc">{{ getRankCountText() }} <span class="ac-num">{{ item?.acceptedCount ?? 0 }}</span> 题</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.problem-list-view { 
  max-width: 1200px; 
  margin: 20px auto; 
  padding: 0 20px; 
}

.list-card {
  border-radius: 12px; 
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}
.list-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
}

.search-card { 
  margin-bottom: 20px; 
  padding: 8px 0; 
}

.table-card { 
  min-height: 500px; 
}

.tag-item { 
  margin-right: 5px; 
}

.pagination-container { 
  margin-top: 24px; 
  display: flex; 
  justify-content: flex-end; 
}

/* 排行榜样式 */
.rank-header {
  color: #303133;
}
:deep(.el-card__header) {
  border-bottom: 1px solid #f2f6fc;
  padding: 15px 20px;
}

.rank-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #f2f6fc;
}
.rank-tabs :deep(.el-tabs__item) {
  height: 44px;
  line-height: 44px;
  font-size: 13px;
}

.rank-list {
  min-height: 200px;
  padding: 5px 0;
}

.empty-rank {
  padding: 20px 0;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 14px 8px; 
  border-radius: 8px; 
  transition: background-color 0.2s;
  cursor: default;
}
.rank-item:hover {
  background-color: #f9fafe; 
}

/* ✅ 高亮自己的排名 */
.rank-item.my-rank {
  background-color: #ecf5ff;
}

.rank-index {
  width: 36px;
  text-align: center;
  font-size: 18px;
  margin-right: 8px;
  font-family: 'Bahnschrift', 'Impact', sans-serif; 
}

.rank-user {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.user-avatar {
  background: linear-gradient(135deg, #a0cfff 0%, #409eff 100%); 
  flex-shrink: 0;
  margin-right: 12px;
  font-size: 14px;
  color: #fff;
  border: 1px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-info {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.nickname {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.desc {
  font-size: 12px;
  color: #909399;
}

.ac-num {
  color: #409eff;
  font-weight: bold;
  font-family: monospace;
}
</style>