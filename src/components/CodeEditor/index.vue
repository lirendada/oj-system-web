<script setup lang="ts">
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'

const props = withDefaults(defineProps<{
  modelValue: string
  language: string
  theme?: string
  fontSize?: number
}>(), {
  theme: 'vs-dark',
  fontSize: 14
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// ✅ 核心修复：语言名称映射函数
// 将后端/UI使用的 "C++" 转换为 Monaco 需要的 "cpp"
const getMonacoLanguage = (lang: string) => {
  const lower = lang.toLowerCase()
  if (lower === 'c++' || lower === 'cpp') return 'cpp'
  if (lower === 'python') return 'python'
  if (lower === 'java') return 'java'
  return lower // 默认尝试小写
}

onMounted(() => {
  if (!editorContainer.value) return

  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: getMonacoLanguage(props.language), // ✅ 使用映射后的语言 ID
    theme: props.theme,
    fontSize: props.fontSize,
    // ✅ 新增：指定 Monaco 使用 LeetCode 同款代码字体
    fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    }
  })

  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor?.getValue() || '')
  })
})

// ✅ 监听语言变化，同样使用映射
watch(() => props.language, (newLang) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, getMonacoLanguage(newLang))
    }
  }
})

// 监听主题变化
watch(() => props.theme, (newTheme) => {
  if (editor && newTheme) {
    monaco.editor.setTheme(newTheme)
  }
})

// 监听字号变化
watch(() => props.fontSize, (newSize) => {
  if (editor && newSize) {
    editor.updateOptions({ fontSize: newSize })
  }
})

watch(() => props.modelValue, (newVal) => {
  if (editor && newVal !== editor.getValue()) {
    editor.setValue(newVal)
  }
})

onBeforeUnmount(() => {
  editor?.dispose()
})
</script>

<template>
  <div ref="editorContainer" class="code-editor" />
</template>

<style scoped>
.code-editor {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>