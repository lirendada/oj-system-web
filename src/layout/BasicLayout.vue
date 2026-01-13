<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GlobalHeader from '@/components/GlobalHeader.vue'
import { CaretTop } from '@element-plus/icons-vue'

const route = useRoute()

// ✅ 判断是否为题目详情页 (根据你的路由路径调整，假设是 /problem/detail/:id)
// 如果你的路由是 /problem/:id，请改为 startsWith('/problem/') 并排除列表页
const isProblemDetail = computed(() => {
  return route.path.startsWith('/problem/detail/')
})
</script>

<template>
  <div class="basic-layout" :class="{ 'full-screen-layout': isProblemDetail }">
    <GlobalHeader />
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="global-footer" v-if="!isProblemDetail">
      <p>Liren OJ &copy; 2026 Designed by Liren</p>
    </footer>

    <el-backtop :right="40" :bottom="40" v-if="!isProblemDetail">
      <div class="back-to-top-btn">
        <el-icon><CaretTop /></el-icon>
      </div>
    </el-backtop>
  </div>
</template>

<style scoped>
.basic-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.main-content {
  flex: 1;
  padding-top: 20px; /* 默认 Padding */
  width: 100%;
}

/* ==============================================
   ✅ 新增：全屏工作台模式样式 (LeetCode 模式)
   ============================================== */
.full-screen-layout {
  height: 100vh;      /* 锁死高度 */
  overflow: hidden;   /* 禁止 body 滚动 */
}

.full-screen-layout .main-content {
  padding-top: 0;     /* 移除顶部间距 */
  padding-bottom: 0;  /* 移除底部间距 */
  height: calc(100vh - 60px); /* 减去 Header 高度，Header 默认 60px */
  overflow: hidden;   /* 禁止 main 滚动，交给内部组件滚动 */
}

.global-footer {
  text-align: center;
  padding: 20px 0;
  color: #909399;
  font-size: 13px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
  /* margin-top: 40px;  <-- 建议移除这个 margin-top，改用 flex gap 或 padding 控制，防止布局抖动 */
}

.back-to-top-btn {
  height: 100%;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 6px rgba(0,0,0,0.12);
  text-align: center;
  line-height: 40px;
  color: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}
.back-to-top-btn:hover {
  background-color: #f2f6fc;
}
</style>