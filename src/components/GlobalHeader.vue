<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Search, User, SwitchButton, Edit, Trophy, Coin } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const DEFAULT_AVATAR = 'https://p.ssl.qhimg.com/sdm/480_480_/t01520a1bd1802ae864.jpg'

// 滚动隐藏逻辑
const isHidden = ref(false)
let lastScrollTop = 0
const SCROLL_THRESHOLD = 50 

const handleScroll = () => {
  const currentScrollTop = window.scrollY || document.documentElement.scrollTop
  if (currentScrollTop < SCROLL_THRESHOLD) {
    isHidden.value = false
    lastScrollTop = currentScrollTop
    return
  }
  if (currentScrollTop > lastScrollTop) {
    isHidden.value = true
  } else {
    isHidden.value = false
  }
  lastScrollTop = currentScrollTop
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const activeIndex = computed(() => {
  if (route.path.startsWith('/problem')) return '/problem'
  if (route.path.startsWith('/contest')) return '/contest'
  return '/'
})

const handleSelect = (key: string) => {
  router.push(key)
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const userAvatar = computed(() => {
  const info = userStore.userInfo as any
  if (!info) return DEFAULT_AVATAR
  const user = info.user || info
  return user.avatar || DEFAULT_AVATAR
})

const nickName = computed(() => {
  const info = userStore.userInfo as any
  if (!info) return '未登录'
  const user = info.user || info
  return user.nickName || user.nickname || user.userName || '用户'
})

const isLogin = computed(() => !!userStore.token)

// ================= 搜索逻辑开始 =================
const searchKeyword = ref('')
const searchType = ref('problem') // 默认搜题目

// 监听路由变化，自动切换搜索类型（优化体验）
// 如果用户在比赛列表页，搜索框默认应该搜比赛
import { watch } from 'vue'
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/contest')) {
    searchType.value = 'contest'
  } else {
    searchType.value = 'problem'
  }
})

const handleGlobalSearch = () => {
  if (!searchKeyword.value.trim()) return
  
  // 跳转到对应页面，带上 keyword 参数
  router.push({
    path: searchType.value === 'problem' ? '/problem' : '/contest',
    query: {
      keyword: searchKeyword.value
    }
  })
}
// ================= 搜索逻辑结束 =================
</script>

<template>
  <el-header class="global-header" :class="{ 'header-hidden': isHidden }">
    <div class="header-content">
      <div class="header-left">
        <div class="logo" @click="router.push('/')">
          <span class="logo-text">Liren OJ</span>
        </div>
        
        <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
          class="nav-menu"
        >
          <el-menu-item index="/problem">
            <el-icon><Coin /></el-icon>
            题库
          </el-menu-item>
          <el-menu-item index="/contest">
            <el-icon><Trophy /></el-icon>
            竞赛
          </el-menu-item>
        </el-menu>
      </div>

      <div class="header-center">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索..."
          class="search-input"
          @keyup.enter="handleGlobalSearch"
        >
          <template #prepend>
            <el-select v-model="searchType" style="width: 85px">
              <el-option label="题目" value="problem" />
              <el-option label="竞赛" value="contest" />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" @click="handleGlobalSearch" />
          </template>
        </el-input>
      </div>

      <div class="header-right">
        <template v-if="isLogin">
          <el-dropdown trigger="click" popper-class="user-dropdown">
            <div class="user-profile">
              <el-avatar :size="36" :src="userAvatar" class="avatar" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <div class="dropdown-user-info">
                  <div class="u-nickname">{{ nickName }}</div>
                  <div class="u-desc">欢迎回到 Liren OJ</div>
                </div>
                <el-dropdown-item divided :icon="User">个人中心</el-dropdown-item>
                <el-dropdown-item :icon="Edit">修改资料</el-dropdown-item>
                <el-dropdown-item divided :icon="SwitchButton" @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" round @click="router.push('/login')">登录 / 注册</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<style scoped>
.global-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease-in-out; 
}
.header-hidden { transform: translateY(-100%); box-shadow: none; }
.header-content { max-width: 1200px; margin: 0 auto; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; }
.header-left { display: flex; align-items: center; height: 100%; }
.logo { font-size: 20px; font-weight: bold; color: #409eff; margin-right: 40px; cursor: pointer; display: flex; align-items: center; }
.nav-menu { border-bottom: none !important; height: 60px; background: transparent; }
:deep(.el-menu-item) { font-size: 15px; color: #606266; height: 60px; line-height: 60px; }
:deep(.el-menu-item.is-active) { border-bottom: 2px solid #409eff; font-weight: 600; }
:deep(.el-menu-item:hover) { background-color: rgba(64, 158, 255, 0.05) !important; color: #409eff; }

/* 搜索框样式优化 */
.header-center { flex: 1; display: flex; justify-content: center; max-width: 500px; margin: 0 20px; }
.search-input { width: 100%; }

/* 调整 Element Plus 复合输入框的圆角和边框 */
:deep(.el-input-group__prepend) {
  background-color: #fff;
  padding: 0 10px;
}
:deep(.el-input-group__append) {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}
:deep(.el-input-group__append:hover) {
  background-color: #66b1ff;
}

.header-right { display: flex; align-items: center; min-width: 60px; justify-content: flex-end; }
.user-profile { display: flex; align-items: center; cursor: pointer; padding: 2px; border-radius: 50%; transition: all 0.3s; }
.user-profile:hover { box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.15); }
.avatar { background: #f5f7fa; border: 1px solid #ebeef5; }
.dropdown-user-info { padding: 12px 16px; text-align: center; min-width: 150px; }
.u-nickname { font-size: 16px; font-weight: 600; color: #303133; margin-bottom: 4px; }
.u-desc { font-size: 12px; color: #909399; }
</style>