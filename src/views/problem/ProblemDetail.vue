<script setup lang="ts">
import { onMounted, ref, reactive, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { 
  getProblemDetail, 
  submitProblem, 
  getSubmitResult,
  getProblemSubmitList // ✅ 引入新接口
} from '@/api/problem'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import CodeEditor from '@/components/CodeEditor/index.vue'
import MdViewer from '@/components/MdViewer/index.vue'
import { 
  Setting, 
  CircleCheckFilled, 
  CircleCloseFilled, 
  Timer, 
  Platform, 
  RefreshRight, 
  CaretRight, 
  EditPen,
  List,
  Document, // ✅
  Clock     // ✅
} from '@element-plus/icons-vue'
import { 
  type ProblemDetailVO, 
  type ProblemSubmitDTO, 
  DifficultyText, 
  DifficultyEnum, 
  LanguageEnum, 
  SubmitStatusEnum, 
  JudgeResultEnum, 
  JudgeResultText 
} from '@/types/global'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

const route = useRoute()
const userStore = useUserStore()
const problem = ref<ProblemDetailVO>()
const loading = ref(false)
const submitting = ref(false)

// ✅ Tab 相关状态
const activeTab = ref<'description' | 'submissions'>('description')

// ✅ 提交记录列表相关状态
const submitList = ref<any[]>([])
const submitTotal = ref(0)
const submitLoading = ref(false)
const submitQuery = reactive({
  current: 1,
  pageSize: 10
})

const resultDialogVisible = ref(false)
const currentResult = ref<any>(null)
const pollingTimer = ref<any>(null)

const editorConfig = reactive({
  theme: localStorage.getItem('oj_editor_theme') || 'vs-dark',
  fontSize: Number(localStorage.getItem('oj_editor_fontsize')) || 14
})

watch(() => editorConfig.theme, (val) => localStorage.setItem('oj_editor_theme', val))
watch(() => editorConfig.fontSize, (val) => localStorage.setItem('oj_editor_fontsize', String(val)))

const form = reactive<ProblemSubmitDTO>({
  problemId: '',
  language: LanguageEnum.JAVA,
  code: '',
  contestId: undefined
})

const languageOptions = [
  { 
    label: 'Java', 
    value: LanguageEnum.JAVA, 
    template: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // 请在此编写代码
        
    }
}` 
  },
  { 
    label: 'C++', 
    value: LanguageEnum.CPP, 
    template: `#include <iostream>
using namespace std;

int main() {
    // 请在此编写代码
    
    return 0;
}` 
  },
  { 
    label: 'Python', 
    value: LanguageEnum.PYTHON, 
    template: `import sys

if __name__ == "__main__":
    # 读取所有输入
    # lines = sys.stdin.read().splitlines()
    pass` 
  }
]

const codeCache = reactive<Record<string, string>>({})

const getStorageKey = (problemId: string) => {
  const userId = userStore.userInfo?.user?.userId || 'guest'
  return `oj_code_${userId}_${problemId}`
}

const initCodeCache = (problemId: string) => {
  languageOptions.forEach(opt => {
    codeCache[opt.value] = opt.template
  })

  const storageKey = getStorageKey(problemId)
  const savedCache = localStorage.getItem(storageKey)

  if (savedCache) {
    try {
      const parsed = JSON.parse(savedCache)
      Object.assign(codeCache, parsed)
    } catch (e) {
      console.error('读取代码缓存失败', e)
    }
  }

  form.code = codeCache[form.language] || ''
}

const saveToLocalStorage = () => {
  if (!form.problemId) return
  codeCache[form.language] = form.code
  localStorage.setItem(getStorageKey(form.problemId), JSON.stringify(codeCache))
}

watch(() => form.language, (newLang, oldLang) => {
  if (oldLang) {
    codeCache[oldLang] = form.code
  }
  form.code = codeCache[newLang] || ''
  saveToLocalStorage()
})

watch(() => form.code, (newCode) => {
  codeCache[form.language] = newCode
})

const handleResetCode = () => {
  ElMessageBox.confirm(
    '确定要重置当前代码吗？这将丢失您当前编写的所有内容。',
    '重置确认',
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const option = languageOptions.find(opt => opt.value === form.language)
    if (option) {
      form.code = option.template
      codeCache[form.language] = option.template
      saveToLocalStorage()
      ElMessage.success('代码已重置为默认模版')
    }
  }).catch(() => {})
}

// ✅ 加载题目详情
const loadDetail = async () => {
  const idStr = route.params.id as string
  if (!idStr) return

  // 尝试从路由参数中获取 contestId
  if (route.query.contestId) {
    form.contestId = Number(route.query.contestId)
  } else if (route.params.contestId) {
    form.contestId = Number(route.params.contestId)
  }

  loading.value = true
  try {
    const res = await getProblemDetail(idStr)
    const data = res?.data
    problem.value = data
    form.problemId = data?.problemId
    if (data?.problemId) {
      initCodeCache(form.problemId)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// ✅ 加载提交记录列表
const loadSubmitList = async () => {
  if (!form.problemId) return
  submitLoading.value = true
  try {
    const res = await getProblemSubmitList({
      problemId: form.problemId,
      current: submitQuery.current,
      pageSize: submitQuery.pageSize
    })
    const data = res?.data
    submitList.value = data?.records || []
    submitTotal.value = Number(data?.total || 0)
  } catch (error) {
    console.error(error)
    submitList.value = []
    submitTotal.value = 0
  } finally {
    submitLoading.value = false
  }
}

// ✅ 切换 Tab
const handleTabChange = (tab: 'description' | 'submissions') => {
  activeTab.value = tab
  if (tab === 'submissions') {
    submitQuery.current = 1
    loadSubmitList()
  }
}

// ✅ 点击记录查看详情
const handleRecordClick = async (row: any) => {
  try {
    const res = await getSubmitResult(row.submitId)
    showResult(res?.data)
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// ✅ 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-'
  return new Date(timeStr).toLocaleString()
}

const handleSubmit = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后再提交代码')
    return
  }
  
  if (!form.code.trim()) {
    ElMessage.warning('代码不能为空')
    return
  }
  saveToLocalStorage()
  submitting.value = true
  try {
    const submitId = await submitProblem(form)
    ElMessage.success('提交成功，正在判题...')
    startPolling(submitId)
    // 如果当前在提交记录页，刷新一下
    if (activeTab.value === 'submissions') {
      loadSubmitList()
    }
  } catch (error) {
    console.error(error)
    submitting.value = false
  }
}

const startPolling = (submitId: string) => {
  if (pollingTimer.value) clearInterval(pollingTimer.value)
  let retryCount = 0
  const maxRetries = 40
  pollingTimer.value = setInterval(async () => {
    try {
      retryCount++
      const res = await getSubmitResult(submitId)
      const data = res?.data
      if (data && data.status !== SubmitStatusEnum.PENDING && data.status !== SubmitStatusEnum.JUDGING) {
        clearInterval(pollingTimer.value)
        submitting.value = false
        showResult(data)
        // 判题结束，刷新列表
        if (activeTab.value === 'submissions') {
           loadSubmitList()
        }
      }
      if (retryCount > maxRetries) {
        clearInterval(pollingTimer.value)
        submitting.value = false
        ElMessage.warning('判题时间过长，请稍后在提交记录中查看')
      }
    } catch (error) {
      clearInterval(pollingTimer.value)
      submitting.value = false
    }
  }, 1000)
}

const showResult = (res: any) => {
  currentResult.value = res
  resultDialogVisible.value = true
}

onMounted(() => {
  loadDetail()
})

onBeforeUnmount(() => {
  saveToLocalStorage()
  if (pollingTimer.value) clearInterval(pollingTimer.value)
})
</script>

<template>
  <div class="problem-detail-container">
    <splitpanes class="default-theme" style="height: 100%">
      
      <pane min-size="20" :size="45">
        <div class="panel-content left-panel">
          
          <div class="pane-header tab-header">
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'description' }"
              @click="handleTabChange('description')"
            >
              <el-icon><Document /></el-icon> 题目描述
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeTab === 'submissions' }"
              @click="handleTabChange('submissions')"
            >
              <el-icon><Clock /></el-icon> 提交记录
            </div>
          </div>
          
          <div class="pane-body" v-loading="loading">
            
            <div v-show="activeTab === 'description'" class="scroll-content typography-content" v-if="problem">
              <div class="problem-title-area">
                <h1 class="main-title">{{ problem?.problemId }}. {{ problem?.title }}</h1>
                <div class="meta-info">
                   <span class="difficulty-badge" 
                        :class="problem.difficulty === DifficultyEnum.EASY ? 'easy' : 
                               (problem.difficulty === DifficultyEnum.MEDIUM ? 'medium' : 'hard')">
                      {{ DifficultyText[problem.difficulty] }}
                   </span>
                   <span class="meta-divider">|</span>
                   <div class="tags-wrapper">
                      <span v-for="tag in problem?.tags" :key="tag.tagId" class="tag-pill">{{ tag.tagName }}</span>
                   </div>
                </div>
              </div>

              <div class="description-block">
                <MdViewer :content="problem.description" />
              </div>

              <div class="section-title">输入输出示例</div>
              <div class="samples-container">
                <div class="sample-item">
                  <div class="sample-label">输入：</div>
                  <div class="code-box">{{ problem.sampleInput }}</div>
                </div>
                <div class="sample-item">
                   <div class="sample-label">输出：</div>
                   <div class="code-box">{{ problem.sampleOutput }}</div>
                </div>
              </div>
              
              <template v-if="problem.hint">
                 <div class="section-title">提示</div>
                 <MdViewer :content="problem.hint" />
              </template>
              
              <div class="limits-footer">
                <div class="limit-item"><el-icon><Timer /></el-icon> {{ problem.timeLimit }} ms</div>
                <div class="limit-item"><el-icon><Platform /></el-icon> {{ problem.memoryLimit }} MB</div>
              </div>
            </div>

            <div v-show="activeTab === 'submissions'" class="submission-list-container">
              <el-table 
                :data="submitList" 
                v-loading="submitLoading" 
                style="width: 100%" 
                @row-click="handleRecordClick"
                class="record-table"
              >
                <el-table-column label="状态" width="120">
                  <template #default="{ row }">
                    <span 
                      :class="{
                        'status-ac': row.judgeResult === JudgeResultEnum.AC,
                        'status-wa': row.judgeResult !== JudgeResultEnum.AC
                      }"
                      style="font-weight: 600; font-size: 13px;"
                    >
                      {{ JudgeResultText[row.judgeResult] || '未知' }}
                    </span>
                  </template>
                </el-table-column>
                
                <el-table-column prop="language" label="语言" width="100" />
                
                <el-table-column label="执行用时" width="100">
                  <template #default="{ row }">
                     {{ row.timeCost !== null ? row.timeCost + ' ms' : 'N/A' }}
                  </template>
                </el-table-column>
                
                <el-table-column label="消耗内存">
                  <template #default="{ row }">
                     {{ row.memoryCost !== null ? (row.memoryCost / 1024).toFixed(1) + ' MB' : 'N/A' }}
                  </template>
                </el-table-column>
                
                <el-table-column label="提交时间" min-width="160">
                   <template #default="{ row }">
                     <span style="color: #909399; font-size: 12px;">{{ formatTime(row.createTime) }}</span>
                   </template>
                </el-table-column>
              </el-table>

              <div class="pagination-wrapper">
                 <el-pagination
                  v-model:current-page="submitQuery.current"
                  v-model:page-size="submitQuery.pageSize"
                  :total="submitTotal"
                  layout="prev, pager, next"
                  small
                  background
                  @current-change="loadSubmitList"
                />
              </div>
            </div>

          </div>
        </div>
      </pane>

      <pane min-size="20" :size="55">
        <div class="panel-content right-panel">
          <div class="pane-header editor-header">
            <div class="header-left">
                <div class="pane-title">
                   <el-icon><EditPen /></el-icon> Code
                </div>
            </div>
            
            <div class="header-right">
                <el-select 
                  v-model="form.language" 
                  size="small"
                  class="lang-select"
                >
                  <el-option v-for="opt in languageOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>

                <div class="divider-v"></div>

                <el-tooltip content="重置代码" placement="bottom" :show-after="500">
                  <el-button link :icon="RefreshRight" class="icon-btn" @click="handleResetCode" />
                </el-tooltip>

                <el-popover placement="bottom" title="编辑器设置" :width="200" trigger="click">
                  <template #reference>
                     <el-button link :icon="Setting" class="icon-btn" />
                  </template>
                  <el-form label-position="left" label-width="50px" size="small">
                      <el-form-item label="主题">
                      <el-select v-model="editorConfig.theme">
                          <el-option label="Dark" value="vs-dark" />
                          <el-option label="Light" value="vs" />
                      </el-select>
                      </el-form-item>
                      <el-form-item label="字号">
                      <el-input-number v-model="editorConfig.fontSize" :min="12" :max="24" controls-position="right" style="width: 100%" />
                      </el-form-item>
                  </el-form>
                </el-popover>
                
                <el-button 
                  type="success" 
                  :loading="submitting" 
                  size="small"
                  round
                  class="run-btn"
                  @click="handleSubmit" 
                >
                  <el-icon><CaretRight /></el-icon> 提交运行
                </el-button>
            </div>
          </div>

          <div class="pane-body no-padding">
             <CodeEditor 
              v-model="form.code" 
              :language="form.language" 
              :theme="editorConfig.theme"
              :font-size="editorConfig.fontSize"
              style="height: 100%;" 
            />
          </div>
        </div>
      </pane>
    </splitpanes>

    <el-dialog v-model="resultDialogVisible" title="提交详情" width="450px" align-center class="result-dialog">
        <div class="result-content" v-if="currentResult">
            <div class="status-icon-wrapper">
               <transition name="el-zoom-in-center">
                  <el-icon v-if="currentResult.judgeResult === JudgeResultEnum.AC" class="success-icon"><CircleCheckFilled /></el-icon>
                  <el-icon v-else class="error-icon"><CircleCloseFilled /></el-icon>
               </transition>
            </div>
            
            <h2 class="result-text" :class="{'text-success': currentResult.judgeResult === JudgeResultEnum.AC, 'text-error': currentResult.judgeResult !== JudgeResultEnum.AC}">
                {{ JudgeResultText[currentResult.judgeResult] || '未知结果' }}
            </h2>
            
            <div class="metrics-grid">
                <div class="metric-item">
                   <span class="label">时间</span>
                   <span class="value">{{ currentResult.timeCost ?? 0 }} ms</span>
                </div>
                <div class="metric-item">
                   <span class="label">内存</span>
                   <span class="value">{{ currentResult.memoryCost !== null ? (currentResult.memoryCost / 1024).toFixed(1) : 0 }} MB</span>
                </div>
                <div class="metric-item full-width">
                   <span class="label">通过用例</span>
                   <span class="value">{{ currentResult.passCaseCount ?? 0 }} / {{ currentResult.totalCaseCount ?? 0 }}</span>
                </div>
            </div>

            <div v-if="currentResult.code" class="code-preview">
                 <div class="console-header">提交代码</div>
                 <pre>{{ currentResult.code }}</pre>
            </div>

            <div v-if="currentResult.errorMessage" class="error-console">
                <div class="console-header">错误日志</div>
                <pre>{{ currentResult.errorMessage }}</pre>
            </div>
        </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/* 引入一些高级灰变量 */
$bg-color: #ffffff;
$bg-secondary: #fafafa;
$border-color: #f0f0f0;
$text-primary: #262626;
$text-secondary: #595959;
$text-tertiary: #8c8c8c;
$primary-color: #409eff;
$success-color: #67c23a;
$danger-color: #f56c6c;

.problem-detail-container {
  height: 100%;
  width: 100%;
  background-color: $bg-color;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 面板通用布局 */
.panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
}

.left-panel { border-right: 1px solid $border-color; }

/* 头部 Header - 极简风格 */
.pane-header {
  height: 48px;
  min-height: 48px;
  padding: 0 20px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  
  .pane-title {
    font-size: 14px;
    font-weight: 600;
    color: $text-secondary;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

/* ✅ Tab Header 样式 */
.tab-header {
  gap: 20px;
  justify-content: flex-start !important; 
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: $text-secondary;
  cursor: pointer;
  height: 100%;
  position: relative;
  transition: color 0.2s;
  
  &:hover { color: $primary-color; }
  
  &.active {
    color: $text-primary;
    font-weight: 600;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: $text-primary; 
    }
  }
}

.editor-header {
  justify-content: space-between;
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

/* 分割线 */
.divider-v {
  width: 1px;
  height: 16px;
  background-color: #e0e0e0;
  margin: 0 4px;
}

/* 按钮微调 */
.icon-btn {
  color: $text-tertiary;
  font-size: 16px;
  &:hover { color: $primary-color; background-color: transparent; }
}
.run-btn {
  font-weight: 500;
  padding: 0 16px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(103, 194, 58, 0.2);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(103, 194, 58, 0.3);
  }
  &:active { transform: translateY(0); }
}

.lang-select {
  width: 100px;
  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    background: transparent;
    padding: 0;
  }
  :deep(.el-input__inner) {
    font-weight: 500;
    color: $text-primary;
    text-align: right;
  }
}

/* 内容区域 */
.pane-body {
  flex: 1;
  overflow-y: overlay;
  position: relative;
  
  &.no-padding { overflow: hidden; }
}

.scroll-content {
  padding: 24px 32px;
  max-width: 900px;
  margin: 0 auto;
}

/* 标题区排版 */
.problem-title-area {
  margin-bottom: 32px;
  
  .main-title {
    font-size: 24px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 12px 0;
    line-height: 1.4;
  }
  
  .meta-info {
    display: flex;
    align-items: center;
    font-size: 13px;
    
    .meta-divider { margin: 0 12px; color: #e0e0e0; }
  }
}

/* 难度徽章 */
.difficulty-badge {
  font-weight: 500;
  &.easy { color: $success-color; }
  &.medium { color: #faad14; }
  &.hard { color: $danger-color; }
}

/* 标签样式 */
.tags-wrapper {
  display: flex;
  gap: 6px;
  
  .tag-pill {
    background-color: #f5f5f5;
    color: $text-secondary;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    transition: all 0.2s;
    cursor: default;
    
    &:hover { background-color: #eeeeee; }
  }
}

/* 正文排版优化 (Typography) */
.typography-content {
  color: #333;
  line-height: 1.75;
  font-size: 15px;
  
  :deep(h1), :deep(h2), :deep(h3) {
    color: $text-primary;
    font-weight: 600;
    margin: 24px 0 16px;
  }
  
  :deep(p) { margin-bottom: 16px; }
  
  :deep(code) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    background-color: rgba(0,0,0,0.04);
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 0.9em;
    color: #d63384;
  }
  
  :deep(pre) {
    background-color: $bg-secondary;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid $border-color;
    overflow-x: auto;
    margin-bottom: 20px;
    
    code {
        background-color: transparent;
        color: inherit;
        padding: 0;
        border-radius: 0;
    }
  }
}

/* 样例框样式 */
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin: 24px 0 12px;
  display: flex;
  align-items: center;
  &:before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 14px;
    background-color: $primary-color;
    margin-right: 8px;
    border-radius: 2px;
  }
}

.samples-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sample-item {
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid $border-color;
  overflow: hidden;
  
  .sample-label {
    padding: 8px 12px;
    font-size: 12px;
    color: $text-tertiary;
    border-bottom: 1px solid #f5f5f5;
    background-color: #fcfcfc;
  }
  
  .code-box {
    padding: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: #444;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

/* 底部 Limits */
.limits-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px dashed $border-color;
  display: flex;
  gap: 24px;
  color: $text-tertiary;
  font-size: 13px;
  
  .limit-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

/* 拖拽条重写 */
:deep(.splitpanes__splitter) { 
    background-color: transparent;
    width: 10px; 
    border-left: 1px solid $border-color; 
    margin-left: -1px;
    position: relative;
    
    &:hover {
        background-color: rgba(64, 158, 255, 0.1);
    }
    
    &:before {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 4px;
        height: 30px;
        border-radius: 2px;
        background-color: #dcdfe6;
        transition: background-color 0.2s;
    }
    
    &:hover:before {
        background-color: $primary-color;
    }
}

/* 结果弹窗优化 */
.result-content {
    text-align: center;
    padding: 10px 0;
}
.status-icon-wrapper {
    margin-bottom: 16px;
    .success-icon { font-size: 64px; color: $success-color; filter: drop-shadow(0 4px 12px rgba(103, 194, 58, 0.3)); }
    .error-icon { font-size: 64px; color: $danger-color; filter: drop-shadow(0 4px 12px rgba(245, 108, 108, 0.3)); }
}
.result-text {
    font-size: 20px; margin-bottom: 24px; font-weight: 600;
    &.text-success { color: $success-color; }
    &.text-error { color: $text-primary; }
}
.metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
    
    .metric-item {
        background-color: #f5f7fa;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        &.full-width { grid-column: span 2; flex-direction: row; justify-content: space-between; align-items: center; }
        
        .label { font-size: 12px; color: $text-tertiary; }
        .value { font-size: 15px; font-weight: 600; color: $text-primary; font-family: monospace; }
    }
}
.error-console, .code-preview {
    text-align: left;
    background-color: #fff1f0;
    border: 1px solid #ffccc7;
    border-radius: 6px;
    overflow: hidden;
    margin-top: 10px;
    
    .console-header {
        background-color: #ffccc7;
        color: #cf1322;
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 600;
    }
    
    pre {
        margin: 0;
        padding: 12px;
        font-size: 12px;
        color: #cf1322;
        max-height: 150px;
        overflow-y: auto;
        white-space: pre-wrap;
        font-family: 'JetBrains Mono', monospace;
    }
}

/* ✅ 提交代码预览样式覆盖 */
.code-preview {
    background-color: $bg-secondary;
    border-color: $border-color;
    
    .console-header {
        background-color: #f5f5f5;
        color: $text-secondary;
        border-bottom: 1px solid $border-color;
    }
    
    pre {
        color: $text-primary;
    }
}

/* ✅ 提交记录列表样式 */
.submission-list-container {
  padding: 0;
}

.record-table {
  :deep(.el-table__row) {
    cursor: pointer;
  }
}

.status-ac { color: $success-color; }
.status-wa { color: $text-secondary; }

.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
}
</style>