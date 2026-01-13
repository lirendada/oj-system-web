<template>
  <div class="register-container">
    <div class="left-panel">
      <div class="slogan-box">
        <h1>Liren OJ</h1>
        <p>Join the community of developers.</p>
      </div>
    </div>

    <div class="right-panel">
      <div class="form-wrapper hover-card">
        <div class="header">
          <h2>创建账号</h2>
          <p class="sub-title">开始你的算法之旅</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          size="large"
          class="register-form"
          @submit.prevent
        >
          <el-form-item prop="userAccount">
            <el-input 
              v-model="form.userAccount" 
              placeholder="请输入账号 (至少4位)"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input 
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码 (至少8位)"
              show-password
              :prefix-icon="Lock"
            />
          </el-form-item>

          <el-form-item prop="checkPassword">
            <el-input 
              v-model="form.checkPassword" 
              type="password" 
              placeholder="请再次确认密码"
              show-password
              :prefix-icon="Check"
            />
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              class="submit-btn" 
              :loading="loading" 
              @click="handleRegister"
            >
              立即注册
            </el-button>
          </el-form-item>
          
          <div class="form-footer">
            <span>已有账号？</span>
            <router-link to="/login" class="login-link">去登录</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Check } from '@element-plus/icons-vue'
import { userRegister } from '@/api/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { UserRegisterRequest } from '@/types/global'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<UserRegisterRequest>({
  userAccount: '',
  password: '',
  checkPassword: '',
})

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  userAccount: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, message: '账号长度不能少于4位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
  ],
  checkPassword: [
    { validator: validatePass2, trigger: 'blur' },
  ],
})

const handleRegister = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await userRegister(form)
        if (Number(res.code) === 1000) {
          ElMessage.success('注册成功，请登录')
          // 【修改点】注册成功后跳转到 /login
          router.push('/login')
        } else {
          ElMessage.error(res.message || '注册失败')
        }
      } catch (error: any) {
        ElMessage.error(error.message || '注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.register-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  
  // 【核心修改】全屏背景处理
  // 这里使用了多重背景：
  // 1. linear-gradient: 从左侧 0% 处的 75% 黑色，平滑过渡到 60% 位置的完全透明。
  //    这样左边的文字有深色背景衬托，右边的卡片则直接浮在原图上。
  // 2. url: 底层的背景图片。
  background: 
    linear-gradient(to right, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%),
    url('@/assets/images/haibala2.jpg') no-repeat center center;
    
  background-size: cover;
  overflow: hidden;

  .left-panel {
    flex: 6; 
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 100px;
    
    // 【核心修改】移除局部背景，防止割裂感
    background: none; 

    .slogan-box {
      color: #fff;
      h1 {
        font-size: 4.5rem;
        font-weight: 800;
        margin-bottom: 24px;
        letter-spacing: 2px;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3); 
      }
      p {
        font-size: 1.6rem;
        opacity: 0.95;
        font-weight: 500;
        text-shadow: 0 1px 5px rgba(0,0,0,0.3);
      }
    }
  }

  .right-panel {
    flex: 4; 
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    // 【核心修改】移除局部背景，完全透明，只保留卡片效果
    background: none; 

    .form-wrapper {
      width: 100%;
      max-width: 440px;
      padding: 45px;
      border-radius: 20px;
      
      // 保持卡片的磨砂质感
      background: rgba(255, 255, 255, 0.8); 
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      
      &.hover-card:hover {
        background: rgba(255, 255, 255, 0.95); 
        transform: translateY(-10px) scale(1.02); 
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12), 
                    0 0 0 1px rgba(255, 255, 255, 1) inset; 
        border-color: #fff;
      }

      .header {
        margin-bottom: 35px;
        text-align: left; 
        h2 {
          font-size: 30px;
          font-weight: 700;
          color: #1a1a1a; 
          margin-bottom: 10px;
        }
        .sub-title {
          color: #555; 
          font-size: 15px;
        }
      }

      .register-form {
        :deep(.el-input__wrapper) {
          background-color: transparent; 
          border: none;
          border-bottom: 2px solid #e0e0e0;
          border-radius: 0;
          box-shadow: none; 
          padding-left: 0;
          padding-bottom: 5px;
          transition: all 0.3s;
          
          &.is-focus {
            border-bottom-color: var(--el-color-primary);
          }
          &:hover:not(.is-focus) {
             border-bottom-color: #999;
          }
        }
        
        :deep(.el-input__prefix-inner > .el-icon) {
          font-size: 18px;
          color: #555;
        }

        :deep(.el-input__inner) {
          font-size: 16px;
          color: #333;
          height: 40px; 
          font-weight: 500;
        }
        
        :deep(.el-input__inner::placeholder) {
           color: #999;
           font-weight: normal;
        }

        .submit-btn {
          width: 100%;
          margin-top: 30px;
          height: 54px;
          font-size: 18px;
          border-radius: 12px;
          font-weight: 700;
          letter-spacing: 4px;
          background: linear-gradient(45deg, #409eff, #36cfc9);
          border: none;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
          
          &:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
          }
          
          &:active {
             transform: translateY(0);
          }
        }
      }

      .form-footer {
        margin-top: 25px;
        text-align: center;
        font-size: 15px;
        color: #555;
        
        .login-link {
          color: var(--el-color-primary);
          text-decoration: none;
          font-weight: 700;
          margin-left: 8px;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .register-container {
    // 移动端背景图不需要那么强的渐变，或者可以调整
    background: url('@/assets/images/haibala2.jpg') no-repeat center center;
    background-size: cover;
    
    .right-panel {
      background: #f5f7fa; 
      .form-wrapper {
        padding: 30px 20px;
        background: #fff !important; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        border-radius: 12px;
        
        &.hover-card:hover {
            transform: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            background: #fff !important;
        }
      }
    }
  }
}
</style>