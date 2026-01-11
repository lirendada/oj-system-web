<script setup lang="ts">
import { onMounted, ref, watch, onBeforeUnmount, toRaw } from 'vue'
import * as monaco from 'monaco-editor'

// 1. 扩展 Props，增加 theme 和 fontSize，并设置默认值
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

onMounted(() => {
  if (!editorContainer.value) return

  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language.toLowerCase(),
    theme: props.theme,          // ✅ 使用传入的主题
    fontSize: props.fontSize,    // ✅ 使用传入的字号
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

// 2. 监听配置变化，动态更新编辑器
watch(() => props.language, (newLang) => {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel()!, newLang.toLowerCase())
  }
})

// ✅ 监听主题变化
watch(() => props.theme, (newTheme) => {
  if (editor && newTheme) {
    monaco.editor.setTheme(newTheme)
  }
})

// ✅ 监听字号变化
watch(() => props.fontSize, (newSize) => {
  if (editor && newSize) {
    editor.updateOptions({ fontSize: newSize })
  }
})

watch(() => props.modelValue, (newVal) => {
  // 注意：这里要避免光标跳动，仅当内容不一致时才 setValue
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