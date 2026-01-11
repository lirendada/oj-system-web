<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import { CaretTop } from '@element-plus/icons-vue' // 引入图标
</script>

<template>
  <div class="basic-layout">
    <GlobalHeader />
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="global-footer">
      <p>Liren OJ &copy; 2026 Designed by Liren</p>
    </footer>

    <el-backtop :right="40" :bottom="40">
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
  padding-top: 20px;
  width: 100%;
}

.global-footer {
  text-align: center;
  padding: 20px 0;
  color: #909399;
  font-size: 13px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
  margin-top: 40px;
}

/* 🟢 自定义回到顶部按钮样式 (可选，Element Plus 默认样式已经不错，这里是为了更圆润) */
.back-to-top-btn {
  height: 100%;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 6px rgba(0,0,0,0.12);
  text-align: center;
  line-height: 40px;
  color: #409eff;
  border-radius: 50%; /* 圆形 */
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