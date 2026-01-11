import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    // 自动导入 Vue 相关函数 (ref, reactive...)
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts', // 自动生成类型声明
    }),
    // 自动导入 Element Plus 组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 设置 @ 指向 src
    },
  },
  server: {
    port: 3000,
    proxy: {
      // 1. 捕获：只要是 /api 开头的请求，都进入这个代理规则
      '/api': {
        // 2. 目标：转发给后端的网关地址
        target: 'http://localhost:10020',
        
        // 3. 允许跨域
        changeOrigin: true,
        
        // 4. 【关键点】重写路径：把 '/api' 替换为空字符串
        // 例如：
        // 前端请求: http://localhost:3000/api/user/login
        // 实际转发: http://localhost:10020/user/login
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})