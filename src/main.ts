import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/styles/index.scss' // 全局样式
import 'element-plus/dist/index.css' // 如果自动导入样式有问题，可手动引入

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')