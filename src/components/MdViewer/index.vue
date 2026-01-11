<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import 'github-markdown-css/github-markdown-light.css' // 引入样式

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt()

// 渲染 HTML
const htmlContent = computed(() => {
  return md.render(props.content || '')
})
</script>

<template>
  <div class="markdown-body" v-html="htmlContent" />
</template>

<style scoped>
.markdown-body {
  background-color: transparent;
  font-size: 14px;
}
</style>