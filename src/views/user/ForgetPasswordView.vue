<template>
  <div id="forget-password-view">
    <h2 style="margin-bottom: 16px; text-align: center">重置密码</h2>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      size="large"
      style="max-width: 480px; margin: 0 auto"
    >
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入注册邮箱" />
      </el-form-item>

      <el-form-item label="验证码" prop="code">
        <div style="display: flex; gap: 16px; width: 100%">
          <el-input v-model="form.code" placeholder="请输入6位验证码" style="flex: 1" />
          <el-button
            type="primary"
            :disabled="isSending || countdown > 0"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="确认新密码" prop="checkPassword">
        <el-input
          v-model="form.checkPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          style="width: 100%"
          :loading="loading"
          @click="handleSubmit"
        >
          重置密码
        </el-button>
      </el-form-item>

      <div style="text-align: right">
        <el-link type="primary" @click="$router.push('/login')">
          返回登录
        </el-link>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { sendForgetCode, resetPassword } from '@/api/user'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const isSending = ref(false)
const countdown = ref(0)
let timer: any = null

const form = reactive({
  email: '',
  code: '',
  newPassword: '',
  checkPassword: '',
})

// 校验规则
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  checkPassword: [{ validator: validatePass2, trigger: 'blur' }],
}

// 发送验证码逻辑
const handleSendCode = async () => {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  // 简单的邮箱格式预校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    ElMessage.warning('邮箱格式不正确')
    return
  }

  try {
    isSending.value = true
    await sendForgetCode(form.email)
    ElMessage.success('验证码已发送，请查收邮件')
    
    // 开始倒计时
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    // 错误处理由 request 拦截器统一处理，这里可根据需要补充
  } finally {
    isSending.value = false
  }
}

// 提交重置
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true
        await resetPassword({
          email: form.email,
          code: form.code,
          newPassword: form.newPassword,
        })
        ElMessage.success('密码重置成功，请重新登录')
        router.push('/login')
      } catch (error) {
        // console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
#forget-password-view {
  /* 简单的居中布局，实际可复用 LoginLayout 或 BasicLayout */
  padding: 32px;
}
</style>