<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
// @ts-ignore
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 确保这个组件路径是正确的，且你已经创建了该文件
import RocketLoader from '@/components/RocketLoader.vue'

const config = {
  locale: zhCn,
  zIndex: 3000,
}

const router = useRouter()
const isRocketing = ref(false)

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const isAuthTransition = 
    (from.name === 'Login' && to.name === 'Register') ||
    (from.name === 'Register' && to.name === 'Login')

  if (isAuthTransition) {
    isRocketing.value = true
    // 延迟 1.5 秒
    await new Promise(resolve => setTimeout(resolve, 1500))
    next()
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach(() => {
  if (isRocketing.value) {
    setTimeout(() => {
      isRocketing.value = false
    }, 500)
  }
})
</script>

<template>
  <el-config-provider :locale="config.locale" :z-index="config.zIndex">
    <RocketLoader :visible="isRocketing" text="WARP SPEED..." />
    <RouterView />
  </el-config-provider>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>