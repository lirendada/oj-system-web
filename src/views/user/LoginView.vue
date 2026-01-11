<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
// 引入全局 DTO 类型
import type { UserLoginDTO } from '@/types/global'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 使用 UserLoginDTO 获得类型提示
const form = reactive<UserLoginDTO>({
  userAccount: '',
  password: ''
})

const rules = reactive<FormRules<UserLoginDTO>>({
  userAccount: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const data = await login(form)
        // UserLoginVO 包含 nickName
        ElMessage.success(`欢迎回来，${data.nickName || '用户'}`)
        userStore.setLoginState(data)
        router.push('/problem')
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">OJ在线判题系统</h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        @keyup.enter="handleLogin(formRef)"
      >
        <el-form-item prop="userAccount">
          <el-input 
            v-model="form.userAccount" 
            placeholder="账号"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            class="submit-btn" 
            :loading="loading"
            @click="handleLogin(formRef)"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #ece9e6, #ffffff);
}
.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}
.submit-btn {
  width: 100%;
}
</style>