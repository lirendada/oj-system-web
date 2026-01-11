<script setup lang="ts">
import { onMounted, ref, reactive, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getProblemDetail, submitProblem, getSubmitResult } from '@/api/problem'
import { ElMessage } from 'element-plus'
import CodeEditor from '@/components/CodeEditor/index.vue'
import MdViewer from '@/components/MdViewer/index.vue'
import { 
  Setting, 
  CircleCheckFilled, 
  CircleCloseFilled, 
  Timer, 
  Cpu, 
  CircleCheck 
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

// ✅ 引入 splitpanes
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

const route = useRoute()
const problem = ref<ProblemDetailVO>()
const loading = ref(false)
const submitting = ref(false)

// 判题结果相关
const resultDialogVisible = ref(false)
const currentResult = ref<any>(null)
const pollingTimer = ref<any>(null)

// 编辑器配置 (优先读取本地存储)
const editorConfig = reactive({
  theme: localStorage.getItem('oj_editor_theme') || 'vs-dark',
  fontSize: Number(localStorage.getItem('oj_editor_fontsize')) || 14
})

// 监听配置变化并持久化
watch(() => editorConfig.theme, (val) => {
  localStorage.setItem('oj_editor_theme', val)
})
watch(() => editorConfig.fontSize, (val) => {
  localStorage.setItem('oj_editor_fontsize', String(val))
})

// 提交表单
const form = reactive<ProblemSubmitDTO>({
  problemId: -1,
  language: LanguageEnum.JAVA,
  code: '',
  contestId: undefined
})

// 语言选项
const languageOptions = [
  { label: 'Java', value: LanguageEnum.JAVA, template: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n    }\n}' },
  { label: 'C++', value: LanguageEnum.CPP, template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}' },
  { label: 'Python', value: LanguageEnum.PYTHON, template: 'import sys\n\nif __name__ == "__main__":\n    # 读取所有输入\n    lines = sys.stdin.read().splitlines()\n    pass' }
]

const handleLanguageChange = (lang: string) => {
  const selected = languageOptions.find(opt => opt.value === lang)
  if (selected && !form.code) { 
    form.code = selected.template
  }
}

const loadDetail = async () => {
  const idStr = route.params.id as string
  if (!idStr) return
  
  loading.value = true
  try {
    const res = await getProblemDetail(Number(idStr))
    problem.value = res
    form.problemId = Number(res.problemId)
    
    handleLanguageChange(form.language)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 提交逻辑
const handleSubmit = async () => {
  if (!form.code.trim()) {
    ElMessage.warning('代码不能为空')
    return
  }
  
  submitting.value = true
  try {
    // 后端返回的是 String 类型的 ID
    const submitId = await submitProblem(form)
    
    ElMessage.success('提交成功，正在判题...')
    
    // 开始轮询
    startPolling(submitId)
    
  } catch (error) {
    console.error(error)
    submitting.value = false
  }
}

// 轮询判题结果
const startPolling = (submitId: string) => {
  if (pollingTimer.value) clearInterval(pollingTimer.value)
  
  let retryCount = 0
  const maxRetries = 40 // 约 40秒超时
  
  pollingTimer.value = setInterval(async () => {
    try {
      retryCount++
      const res = await getSubmitResult(submitId)
      
      // 如果状态不是 PENDING(0) 或 JUDGING(10)，说明结束
      // 注意：请确保 status 枚举值匹配，这里假设 > 10 即为结束
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
      console.error(error)
      // 如果出错不一定要马上停，可能是网络波动，但为了简单演示这里停掉
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
  if (pollingTimer.value) clearInterval(pollingTimer.value)
})
</script>

<template>
  <div class="problem-detail-container">
    <splitpanes class="default-theme" style="height: 100%">
      
      <pane min-size="20" :size="50">
        <div class="panel-content">
          <el-card class="box-card problem-content" v-loading="loading">
            <template #header>
              <div class="card-header">
                <h2>{{ problem?.problemId }}. {{ problem?.title }}</h2>
                <div class="tags">
                  <el-tag v-for="tag in problem?.tags" :key="tag.tagId" size="small">{{ tag.tagName }}</el-tag>
                  <el-tag 
                      v-if="problem?.difficulty" 
                      :type="problem.difficulty === DifficultyEnum.EASY ? 'success' : (problem.difficulty === DifficultyEnum.MEDIUM ? 'warning' : 'danger')" 
                      size="small"
                  >
                      {{ DifficultyText[problem.difficulty] }}
                  </el-tag>
                </div>
              </div>
            </template>
            
            <div class="meta-info" v-if="problem">
              <span>时间限制: {{ problem.timeLimit }}ms</span>
              <span>内存限制: {{ problem.memoryLimit }}MB</span>
              <span>栈限制: {{ problem.stackLimit }}MB</span>
            </div>

            <div class="scroll-content" v-if="problem">
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
            </div>
          </el-card>
        </div>
      </pane>

      <pane min-size="20" :size="50">
        <div class="panel-content">
          <el-card class="box-card editor-card">
            <template #header>
              <div class="editor-header">
                <div class="header-left">
                  <span>代码编辑</span>
                </div>
                
                <div class="actions">
                  <el-popover placement="bottom" title="编辑器设置" :width="220" trigger="click">
                    <template #reference>
                      <el-button :icon="Setting" circle style="margin-right: 10px" title="设置" />
                    </template>
                    <el-form label-position="left" label-width="60px" size="small">
                      <el-form-item label="主题">
                        <el-select v-model="editorConfig.theme" placeholder="选择主题">
                          <el-option label="暗黑模式 (Dark)" value="vs-dark" />
                          <el-option label="亮色模式 (Light)" value="vs" />
                          <el-option label="高对比度 (HC)" value="hc-black" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="字号">
                        <el-input-number v-model="editorConfig.fontSize" :min="12" :max="24" controls-position="right" style="width: 100%" />
                      </el-form-item>
                    </el-form>
                  </el-popover>

                  <el-select 
                    v-model="form.language" 
                    placeholder="选择语言" 
                    style="width: 120px"
                    @change="handleLanguageChange"
                  >
                    <el-option v-for="opt in languageOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                  
                  <el-button type="success" :loading="submitting" @click="handleSubmit" style="margin-left: 10px">
                    提交运行
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
.problem-detail-container {
  height: calc(100vh - 80px);
  padding: 10px 20px 20px 20px;
  overflow: hidden;
}

/* 布局调整 */
.panel-content {
  height: 100%;
  padding-right: 5px;
}
.splitpanes__pane:last-child .panel-content {
  padding-right: 0;
  padding-left: 5px;
}

.box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 覆盖 Element Card Body 样式 */
:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 15px;
}

/* 自定义拖拽条样式 */
:deep(.splitpanes__splitter) {
  background-color: #f0f2f5;
  width: 8px;
  border-left: 1px solid #dcdfe6;
  border-right: 1px solid #dcdfe6;
  cursor: col-resize;
  position: relative;
}
/* 给拖拽条加个小把手图标的效果 */
:deep(.splitpanes__splitter)::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1px;
  height: 20px;
  background-color: #909399;
  box-shadow: 2px 0 0 #909399, -2px 0 0 #909399;
}
:deep(.splitpanes__splitter:hover) {
  background-color: #e6f7ff;
}

.scroll-content { overflow-y: auto; flex: 1; padding-right: 10px; }
.meta-info { margin-bottom: 15px; color: #666; font-size: 13px; }
.meta-info span { margin-right: 20px; }
.sample-box { background: #f5f7fa; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; }
.editor-header { display: flex; justify-content: space-between; align-items: center; }
.header-left { display: flex; align-items: center; gap: 10px; font-weight: bold; }
.actions { display: flex; align-items: center; }

/* 结果弹窗样式 */
.result-content { text-align: center; }
.status-icon { margin-bottom: 10px; }
.metrics { display: flex; justify-content: center; gap: 20px; margin-top: 20px; color: #666; }
.error-msg { text-align: left; background: #fef0f0; padding: 10px; border-radius: 4px; margin-top: 15px; max-height: 200px; overflow-y: auto; }
.error-msg pre { margin: 0; white-space: pre-wrap; color: #f56c6c; font-size: 12px; }
</style>