<script setup lang="ts">
import { onMounted, ref, reactive, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getProblemDetail, submitProblem, getSubmitResult } from '@/api/problem'
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
  EditPen // ✅ 将 Code 改为 EditPen (或者 Monitor)
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
  problemId: -1,
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

const initCodeCache = (problemId: number) => {
  languageOptions.forEach(opt => {
    codeCache[opt.value] = opt.template
  })
  const storageKey = `oj_code_${problemId}`
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
  if (form.problemId <= 0) return
  codeCache[form.language] = form.code
  localStorage.setItem(`oj_code_${form.problemId}`, JSON.stringify(codeCache))
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
    const res = await getProblemDetail(Number(idStr))
    problem.value = res
    form.problemId = Number(res.problemId)
    initCodeCache(form.problemId)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
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
        <div class="panel-content">
          <el-card class="box-card problem-content" v-loading="loading">
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
          </el-card>
        </div>
      </pane>

      <pane min-size="20" :size="60">
        <div class="panel-content">
          <el-card class="box-card editor-card">
            <template #header>
              <div class="editor-header">
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
            </template>
            
            <CodeEditor 
              v-model="form.code" 
              :language="form.language" 
              :theme="editorConfig.theme"
              :font-size="editorConfig.fontSize"
            />
          </el-card>
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

<style scoped>
/* 基础容器 */
.problem-detail-container {
  height: calc(100vh - 80px);
  padding: 0 20px 20px 20px;
  overflow: hidden;
  background-color: #f7f8fa;
}

/* 布局 */
.panel-content {
  height: 100%;
  padding-bottom: 2px;
  padding-right: 8px;
}
.splitpanes__pane:last-child .panel-content {
  padding-right: 0;
  padding-left: 8px;
}

/* 卡片样式 */
.box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  box-sizing: border-box;
  background: #fff;
}

/* ✅ 强制覆盖 Element Plus 卡片头部默认样式，实现极简工具栏 */
:deep(.el-card__header) {
  padding: 0 16px !important; /* 移除原来的大 padding */
  height: 44px; /* 固定一个小高度 */
  line-height: 44px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff; /* 纯白背景 */
}

:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 编辑器头部工具栏内部布局 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.actions {
  display: flex;
  align-items: center;
}

/* 滚动内容区 */
.scroll-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.75;
  color: #262626;
}

/* 标题块 */
.problem-header-block {
  margin-bottom: 30px; 
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}
.problem-header-block h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  line-height: 1.3;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

/* 标签样式 */
:deep(.el-tag--dark.el-tag--success) { --el-tag-bg-color: #00b8a3; --el-tag-border-color: #00b8a3; }
:deep(.el-tag--dark.el-tag--warning) { --el-tag-bg-color: #ffb800; --el-tag-border-color: #ffb800; }
:deep(.el-tag--dark.el-tag--danger) { --el-tag-bg-color: #ff2d55; --el-tag-border-color: #ff2d55; }
:deep(.el-tag--info) { border: none; background-color: #f2f3f5; color: #3c3c43; border-radius: 12px; }

/* 详情标题 */
:deep(.scroll-content h3),
.problem-limits h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-top: 24px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
:deep(.scroll-content h3)::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: #409eff;
  border-radius: 2px;
  margin-right: 4px;
}

/* Markdown 元素 */
:deep(.scroll-content p) { margin-bottom: 1.2em; text-align: justify; }
:deep(.scroll-content code) { font-family: "Menlo", monospace; font-size: 0.9em; background-color: #f2f3f5; color: #262626; padding: 2px 6px; border-radius: 4px; margin: 0 2px; }
:deep(.scroll-content pre), .sample-box { background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: "Menlo", monospace; font-size: 13px; color: #262626; }

/* 底部限制信息 */
.problem-limits {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}
.problem-limits ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.problem-limits li {
  font-size: 14px;
  color: #595959;
  display: flex;
  align-items: center;
}
.problem-limits li span {
  color: #8c8c8c;
  width: 80px;
}

/* 滚动条 */
.scroll-content::-webkit-scrollbar { width: 7px; height: 7px; }
.scroll-content::-webkit-scrollbar-track { background: transparent; }
.scroll-content::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 4px; transition: background-color 0.3s; }
.scroll-content:hover::-webkit-scrollbar-thumb { background-color: #d9d9d9; }
.scroll-content::-webkit-scrollbar-thumb:hover { background-color: #bfbfbf; }

/* 拖拽条 */
:deep(.splitpanes__splitter) { background-color: transparent; width: 12px; margin: 0 -6px; border: none; cursor: col-resize; position: relative; z-index: 100; transition: all 0.2s; }
:deep(.splitpanes__splitter)::before { content: ''; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 2px; height: 24px; background-color: #409eff; border-radius: 1px; opacity: 0; transition: opacity 0.2s; }
:deep(.splitpanes__splitter:hover)::before, :deep(.splitpanes__splitter.splitpanes__splitter--active)::before { opacity: 1; }
:deep(.splitpanes__splitter:hover) { background-color: rgba(64, 158, 255, 0.05); }

/* 结果弹窗 */
.result-content h2 { margin: 10px 0 20px 0; }
.metrics { background: #f5f7fa; padding: 15px; border-radius: 8px; display: flex; justify-content: space-around; }
.metrics p { margin: 0; display: flex; align-items: center; gap: 8px; font-weight: 500; }
</style>