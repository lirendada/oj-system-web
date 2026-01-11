<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getProblemList } from '@/api/problem'
import { Search, Refresh } from '@element-plus/icons-vue'
import { 
  type ProblemVO, 
  type ProblemQueryRequest, 
  DifficultyEnum, 
  DifficultyText 
} from '@/types/global' // 确保引用了您重命名后的 global.ts

const router = useRouter()
const loading = ref(false)
const tableData = ref<ProblemVO[]>([])
const total = ref(0)

const queryParams = reactive<ProblemQueryRequest>({
  current: 1,
  pageSize: 10,
  keyword: '',
  difficulty: undefined
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getProblemList(queryParams)
    tableData.value = res.records
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

// 修正：参数名和类型跟随 problemId
const toDetail = (problemId: number) => {
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

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="problem-list-view">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="关键词">
          <el-input 
            v-model="queryParams.keyword" 
            placeholder="输入题目名称" 
            clearable 
            @keyup.enter="handleSearch"
            style="width: 240px"
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
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="loadData">刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="problemId" label="ID" width="180" />
        
        <el-table-column label="题目名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="toDetail(row.problemId)">{{ row.title }}</el-link>
            
            <span v-if="row.tags && row.tags.length" style="margin-left: 10px">
              <el-tag 
                v-for="tag in row.tags" 
                :key="tag.tagId" 
                size="small" 
                type="info" 
                effect="plain" 
                class="tag-item"
              >
                {{ tag.tagName }}
              </el-tag>
            </span>
          </template>
        </el-table-column>

        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            <el-tag :type="getDifficultyColor(row.difficulty)">
              {{ DifficultyText[row.difficulty as DifficultyEnum] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="通过率" width="120">
          <template #default="{ row }">
            {{ row.submitNum > 0 ? ((row.acceptedNum / row.submitNum) * 100).toFixed(1) + '%' : '0.0%' }}
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
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.problem-list-view { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
.search-card { margin-bottom: 20px; }
.tag-item { margin-right: 5px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>