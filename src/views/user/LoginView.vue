<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login, getInfo } from '@/api/user'
import { User, Lock, ArrowRight, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ✅ 1. 正确引入本地图片 (Vite 方式)
// 请确保图片确实存在于 src/assets/images/haibala.jpg
import bgImg from '@/assets/images/haibala.jpg'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  userAccount: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.userAccount || !form.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  
  loading.value = true
  try {
    // 1. 登录
    const res = await login(form)
    const token = res.data.token 
    if (!token) {
        throw new Error('Token 获取失败')
    }
    userStore.setToken(token)
    
    // 2. ✅ 获取用户信息 (关键修复步骤)
    // 必须等待获取到用户信息后，再跳转，防止下个页面报错
    const infoRes = await getInfo()
    userStore.setUserInfo(infoRes.data)
    
    ElMessage.success('登录成功，欢迎回来')
    router.push('/problem')
    
  } catch (error: any) {
    console.error(error)
    // 如果是密码错误等业务异常，request.ts 已经弹窗了，这里可以不再弹
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container" :style="{ backgroundImage: `url(${bgImg})` }">
    <div class="overlay"></div>

    <div class="login-box">
      <div class="header">
        <h1 class="logo-text">Liren OJ</h1>
      </div>

      <div class="form-body">
        <div class="input-group">
          <el-input 
            v-model="form.userAccount" 
            placeholder="账号 / 邮箱" 
            class="glass-input"
            :prefix-icon="User"
          />
        </div>
        
        <div class="input-group">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="密码" 
            show-password 
            class="glass-input"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="actions">
          <el-checkbox label="记住我" class="remember-checkbox" />
          <el-link type="primary" :underline="false" class="forgot-link">忘记密码?</el-link>
        </div>

        <el-button 
          type="primary" 
          :loading="loading" 
          class="submit-btn" 
          round 
          @click="handleLogin"
        >
          <span v-if="!loading">立即登录</span>
          <el-icon v-else class="is-loading"><Loading /></el-icon>
          <el-icon v-if="!loading" class="btn-icon"><ArrowRight /></el-icon>
        </el-button>

        <div class="footer-links">
          <span>还没有账号?</span>
          <el-link type="primary" class="register-link" @click="$router.push('/register')">去注册</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 容器 */
.login-container {
  height: 100vh;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  /* 字体颜色改为深色，因为卡片是白色的 */
  color: #303133; 
}

/* 遮罩层 (亮色模式) */
.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  /* 使用极淡的白色，让背景图看起来更清新，不像暗黑模式那么压抑 */
  background: rgba(255, 255, 255, 0.1); 
  z-index: 1;
}

/* 登录卡片 - 磨砂白效果 */
.login-box {
  position: relative;
  z-index: 2;
  width: 380px;
  padding: 40px 35px;
  
  /* 核心：白色磨砂玻璃 */
  background: rgba(255, 255, 255, 0.65); 
  backdrop-filter: blur(20px); /* 模糊背景 */
  -webkit-backdrop-filter: blur(20px);
  
  border-radius: 16px;
  /* 白色半透明边框 */
  border: 1px solid rgba(255, 255, 255, 0.8); 
  /* 柔和的投影 */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15); 
  
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.2); 
  }
}

.header {
  text-align: center;
  margin-bottom: 30px;
  
  .logo-text {
    font-size: 32px;
    font-weight: 800;
    margin: 0;
    /* 蓝色渐变文字 */
    background: linear-gradient(120deg, #409eff 0%, #3079ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
  }
  
  .subtitle {
    margin-top: 8px;
    font-size: 14px;
    color: #606266; /* 深灰色 */
    letter-spacing: 1px;
  }
}

.input-group {
  margin-bottom: 20px;
}

/* 输入框亮色风格适配 */
:deep(.glass-input) {
  .el-input__wrapper {
    /* 白色半透明背景 */
    background-color: rgba(255, 255, 255, 0.6) !important; 
    border: 1px solid rgba(0, 0, 0, 0.05); /* 极细的灰色边框 */
    box-shadow: none !important;
    border-radius: 8px;
    padding: 10px 15px;
    transition: all 0.3s;
    
    /* 聚焦时 */
    &:hover, &.is-focus {
      background-color: #fff !important; /* 聚焦变纯白 */
      border-color: #409eff;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
    }
  }
  
  /* 输入文字颜色 */
  .el-input__inner {
    color: #303133; /* 深黑 */
    font-weight: 500;
    &::placeholder {
      color: #909399; /* 浅灰 */
    }
  }
  
  /* 图标颜色 */
  .el-input__prefix-inner {
    color: #606266;
  }
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 0 2px;
  
  :deep(.el-checkbox__label) {
    color: #606266 !important;
  }
  :deep(.el-checkbox__inner) {
    background-color: transparent;
    border-color: #909399;
  }
  
  .forgot-link {
    font-size: 13px;
    color: #909399;
    &:hover { color: #409eff; }
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 2px;
  border-radius: 8px;
  background: linear-gradient(90deg, #409eff, #3a8ee6);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
  }
  
  .btn-icon { margin-left: 6px; }
}

.footer-links {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #606266;
  
  .register-link {
    margin-left: 5px;
    font-weight: 600;
    vertical-align: baseline;
  }
}
</style>