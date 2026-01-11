<script setup lang="ts">
// 1. 引入路由出口组件
import { RouterView } from 'vue-router'
// 2. 引入 Element Plus 的全局配置组件和中文包
import { ElConfigProvider } from 'element-plus'
// @ts-ignore // 忽略这里可能的类型报错，通常是因为 element-plus 类型定义的问题
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 全局配置对象
const config = {
  locale: zhCn, // 设置组件默认语言为中文
  zIndex: 3000, // 设置弹窗的初始 z-index (可选)
}
</script>

<template>
  <el-config-provider :locale="config.locale" :z-index="config.zIndex">
    <RouterView />
  </el-config-provider>
</template>

<style>
/* 3. 核心样式重置：确保整个应用撑满屏幕 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased; /* 字体抗锯齿 */
}
/* 全局重置与基础字体设置 */
body {
  margin: 0;
  padding: 0;
  /* ✅ LeetCode 同款字体栈 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  /* ✅ 让字体在 Mac 上更清晰锐利 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* ✅ 基础字号和颜色 */
  font-size: 14px;
  color: #262626; /* 这种黑不是纯黑，看起来更舒服 */
  background-color: #f7f8fa; /* 整体背景稍微带点灰，不刺眼 */
}

/* 滚动条美化 (Chrome/Safari) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #dfe1e5;
  border-radius: 3px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>