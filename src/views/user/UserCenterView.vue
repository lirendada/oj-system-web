<template>
  <div class="user-center-view">
    <el-page-header 
      @back="goBack" 
      content="个人中心" 
      class="page-header"
      title="返回"
    />

    <el-row :gutter="24" style="align-items: start;">
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="profile-card">
          <div class="profile-header">
            <el-avatar 
              :size="100" 
              :src="userInfo.avatar" 
              class="profile-avatar"
            >
              {{ userInfo.nickName?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
            <h2 class="nickname">{{ userInfo.nickName || '未设置昵称' }}</h2>
            <div class="tags">
              <el-tag v-if="userInfo.userAccount === 'admin'" type="danger" size="small" effect="plain">管理员</el-tag>
              <el-tag v-else type="info" size="small" effect="plain">普通用户</el-tag>
            </div>
            <div class="school-info" v-if="userInfo.school">
              <el-icon><School /></el-icon> {{ userInfo.school }}
            </div>
          </div>

          <el-divider />

          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-val">{{ userInfo.acceptedCount || 0 }}</div>
              <div class="stat-label">通过</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-val">{{ userInfo.submittedCount || 0 }}</div>
              <div class="stat-label">提交</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-val">{{ calculateRate }}%</div>
              <div class="stat-label">通过率</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>详细资料</span>
              <el-button link type="primary" :icon="Edit" @click="openEditDialog">
                修改信息
              </el-button>
            </div>
          </template>
          
          <el-descriptions :column="1" border size="large">
            <el-descriptions-item label="用户 ID">{{ userInfo.userId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="账号">{{ userInfo.userAccount || '-' }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ userInfo.nickName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ userInfo.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学校">
              {{ userInfo.school || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag v-if="userInfo.status === 1" type="success" size="small" effect="plain">正常</el-tag>
              <el-tag v-else type="danger" size="small" effect="plain">禁用</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ userInfo.createTime ? new Date(userInfo.createTime).toLocaleDateString() : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      title="编辑个人资料"
      width="480px"
      align-center
    >
      <el-form :model="editForm" label-width="80px" label-position="right">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickName" placeholder="请输入昵称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="学校">
          <el-input v-model="editForm.school" placeholder="请输入学校" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="editForm.avatar" placeholder="请输入图片链接" />
        </el-form-item>
        <div v-if="editForm.avatar" class="avatar-preview-box">
          <el-avatar :size="60" :src="editForm.avatar" />
          <span class="preview-text">预览</span>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="updating" @click="handleUpdate">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router' // 引入路由
import { useUserStore } from '@/stores/user'
import { updateMyInfo } from '@/api/user'
import { ElMessage } from 'element-plus'
import { Edit, School } from '@element-plus/icons-vue'

const router = useRouter() // 实例化路由
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const dialogVisible = ref(false)
const updating = ref(false)

const editForm = reactive({
  nickName: '',
  avatar: '',
  school: ''
})

// 计算通过率
const calculateRate = computed(() => {
  const sub = userInfo.value.submittedCount || 0
  const ac = userInfo.value.acceptedCount || 0
  if (sub === 0) return '0.0'
  return ((ac / sub) * 100).toFixed(1)
})

// 返回上一页
const goBack = () => {
  router.back()
}

const openEditDialog = () => {
  editForm.nickName = userInfo.value.nickName || ''
  editForm.avatar = userInfo.value.avatar || ''
  editForm.school = userInfo.value.school || ''
  dialogVisible.value = true
}

const handleUpdate = async () => {
  if (!editForm.nickName?.trim()) {
    ElMessage.warning('昵称不能为空')
    return
  }
  try {
    updating.value = true
    await updateMyInfo(editForm)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    await userStore.getLoginUser()
  } catch (error) {
    // 错误处理保留
  } finally {
    updating.value = false
  }
}

onMounted(async () => {
  if (!userInfo.value?.userId) {
    await userStore.getLoginUser()
  }
})
</script>

<style scoped lang="scss">
.user-center-view {
  max-width: 1024px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

// 左侧卡片样式
.profile-card {
  text-align: center;
  margin-bottom: 20px;
  border-radius: 12px;

  .profile-header {
    padding: 10px 0;
  }

  .profile-avatar {
    margin-bottom: 16px;
    background: linear-gradient(135deg, #a0cfff 0%, #409eff 100%);
    font-size: 32px;
    color: #fff;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .nickname {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }

  .tags {
    margin-bottom: 12px;
  }

  .school-info {
    font-size: 14px;
    color: #606266;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
}

// 简约数据统计样式
.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
}

.stat-item {
  text-align: center;
  
  .stat-val {
    font-size: 20px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #909399;
  }
}

.stat-divider {
  width: 1px;
  height: 24px;
  background-color: #e4e7ed;
}

// 右侧详情卡片
.detail-card {
  border-radius: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

// 编辑弹窗微调
.avatar-preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 10px;
  background: #f9fafe;
  border-radius: 4px;
  
  .preview-text {
    font-size: 12px;
    color: #909399;
  }
}
</style>