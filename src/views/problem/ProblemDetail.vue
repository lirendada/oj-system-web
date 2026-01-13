<script setup lang="ts">
import { onMounted, ref, reactive, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getProblemDetail, submitProblem, getSubmitResult } from '@/api/problem'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import CodeEditor from '@/components/CodeEditor/index.vue'
import MdViewer from '@/components/MdViewer/index.vue'
import { 
  Setting, 
  CircleCheckFilled, 
  CircleCloseFilled, 
  Timer, 
  Cpu, 
  CircleCheck,
  RefreshRight,
  InfoFilled,
  CaretRight,
  EditPen
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

// ... (Script 逻辑保持原样，完全不用动) ...
// 注意：确保 CodeEditor 组件本身支持 height="100%"
// 如果 CodeEditor 内部有固定高度，需要改为 CSS flex 自适应

const route = useRoute()
const userStore = useUserStore()
const problem = ref<ProblemDetailVO>()
const loading = ref(false)
const submitting = ref(false)

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

const loadDetail = async () => {
  const idStr = route.params.id as string
  if (!idStr) return
  loading.value = true
  try {
    const res = await getProblemDetail(idStr)
    problem.value = res
    form.problemId = res.problemId
    initCodeCache(form.problemId)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
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
      if (res.status !== SubmitStatusEnum.PENDING && res.status !== SubmitStatusEnum.JUDGING) {
        clearInterval(pollingTimer.value)
        submitting.value = false
        showResult(res)
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
      
      <pane min-size="20" :size="40">
        <div class="panel-content left-panel">
          <div class="pane-header">
            <span class="pane-title"><el-icon><InfoFilled /></el-icon> 题目描述</span>
          </div>
          
          <div class="pane-body" v-loading="loading">
             <div class="scroll-content" v-if="problem">
              <div class="problem-header-block">
                <h2>{{ problem?.problemId }}. {{ problem?.title }}</h2>
                <div class="tags">
                  <el-tag 
                      v-if="problem?.difficulty" 
                      :type="problem.difficulty === DifficultyEnum.EASY ? 'success' : (problem.difficulty === DifficultyEnum.MEDIUM ? 'warning' : 'danger')" 
                      size="small"
                      effect="dark" 
                      style="margin-right: 5px;"
                  >
                      {{ DifficultyText[problem.difficulty] }}
                  </el-tag>
                  <el-tag v-for="tag in problem?.tags" :key="tag.tagId" size="small" type="info">{{ tag.tagName }}</el-tag>
                </div>
              </div>

              <h3>题目描述</h3>
              <MdViewer :content="problem.description" />

              <h3>输入描述</h3>
              <MdViewer :content="problem.inputDescription" />

              <h3>输出描述</h3>
              <MdViewer :content="problem.outputDescription" />

              <div class="samples">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <h3>样例输入</h3>
                    <pre class="sample-box">{{ problem.sampleInput }}</pre>
                  </el-col>
                  <el-col :span="12">
                    <h3>样例输出</h3>
                    <pre class="sample-box">{{ problem.sampleOutput }}</pre>
                  </el-col>
                </el-row>
              </div>
              
              <h3 v-if="problem.hint">提示</h3>
              <MdViewer v-if="problem.hint" :content="problem.hint" />

              <div class="problem-limits">
                <h4><el-icon><InfoFilled /></el-icon> 限制信息</h4>
                <ul>
                  <li><span>时间限制：</span>{{ problem.timeLimit }} ms</li>
                  <li><span>内存限制：</span>{{ problem.memoryLimit }} MB</li>
                  <li><span>堆栈限制：</span>{{ problem.stackLimit }} MB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </pane>

      <pane min-size="20" :size="60">
        <div class="panel-content right-panel">
          <div class="pane-header editor-header-bar">
            <div class="header-left">
                <el-icon :size="16" color="#409eff"><EditPen /></el-icon>
                <span class="header-title">代码</span>
            </div>
            
            <div class="actions">
                <el-select 
                v-model="form.language" 
                placeholder="语言" 
                size="small"
                style="width: 100px; margin-right: 10px;"
                >
                <el-option v-for="opt in languageOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>

                <el-tooltip content="重置代码" placement="bottom">
                <el-button 
                    :icon="RefreshRight" 
                    circle 
                    size="small"
                    @click="handleResetCode" 
                />
                </el-tooltip>

                <el-popover placement="bottom" title="设置" :width="200" trigger="click">
                <template #reference>
                    <el-button :icon="Setting" circle size="small" style="margin-left: 8px" />
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
                @click="handleSubmit" 
                style="margin-left: 15px; padding: 0 15px;"
                >
                <el-icon style="margin-right: 4px"><CaretRight /></el-icon> 运行
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

    <el-dialog v-model="resultDialogVisible" title="判题结果" width="30%" align-center>
        <div class="result-content" v-if="currentResult">
            <div class="status-icon">
                <el-icon v-if="currentResult.judgeResult === JudgeResultEnum.AC" color="#67C23A" size="50"><CircleCheckFilled /></el-icon>
                <el-icon v-else color="#F56C6C" size="50"><CircleCloseFilled /></el-icon>
            </div>
            
            <h2 :style="{ color: currentResult.judgeResult === JudgeResultEnum.AC ? '#67C23A' : '#F56C6C' }">
                {{ JudgeResultText[currentResult.judgeResult] || '未知结果' }}
            </h2>
            
            <div class="metrics">
                <p><el-icon><Timer /></el-icon> 耗时：{{ currentResult.timeCost ?? 0 }} ms</p>
                <p><el-icon><Cpu /></el-icon> 内存：{{ currentResult.memoryCost ?? 0 }} KB</p>
                <p><el-icon><CircleCheck /></el-icon> 用例：{{ currentResult.passCaseCount ?? 0 }} / {{ currentResult.totalCaseCount ?? 0 }}</p>
            </div>

            <div v-if="currentResult.errorMessage" class="error-msg">
                <h4>错误信息：</h4>
                <pre>{{ currentResult.errorMessage }}</pre>
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="resultDialogVisible = false">确 定</el-button>
            </span>
        </template>
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
  height: 48px; /* 稍微高一点，留白 */
  min-height: 48px;
  padding: 0 20px;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px); /* 磨砂效果 */
  
  .pane-title {
    font-size: 14px;
    font-weight: 600;
    color: $text-secondary;
    display: flex;
    align-items: center;
    gap: 8px;
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
  box-shadow: 0 2px 6px rgba(103, 194, 58, 0.2); /* 绿色投影 */
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
    box-shadow: none !important; /* 去除边框 */
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
  overflow-y: overlay; /* 现代浏览器覆盖滚动条 */
  position: relative;
  
  &.no-padding { overflow: hidden; }
}

.scroll-content {
  padding: 24px 32px; /* 增加左右留白，更像阅读模式 */
  max-width: 900px; /* 限制最大宽度，防止大屏阅读困难 */
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
  font-size: 15px; /* 稍微大一点，阅读更舒服 */
  
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
    color: #d63384; /* 代码高亮色 */
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

/* 拖拽条重写 (更优雅) */
:deep(.splitpanes__splitter) { 
    background-color: transparent; /* 透明 */
    width: 10px; 
    border-left: 1px solid $border-color; 
    margin-left: -1px;
    position: relative;
    
    &:hover {
        background-color: rgba(64, 158, 255, 0.1);
    }
    
    &:before { /* 拖拽手柄小圆点 */
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
.error-console {
    text-align: left;
    background-color: #fff1f0;
    border: 1px solid #ffccc7;
    border-radius: 6px;
    overflow: hidden;
    
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
    }
}
</style>