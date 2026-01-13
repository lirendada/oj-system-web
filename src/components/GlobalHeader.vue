<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Search, User, SwitchButton, Edit, Trophy, Coin, CaretBottom } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const DEFAULT_AVATAR = 'https://p.ssl.qhimg.com/sdm/480_480_/t01520a1bd1802ae864.jpg'

// 滚动逻辑
const isHidden = ref(false)
const isScrolled = ref(false) // 新增：是否发生滚动，用于加深背景
let lastScrollTop = 0
const SCROLL_THRESHOLD = 50 

const handleScroll = () => {
  const currentScrollTop = window.scrollY || document.documentElement.scrollTop
  
  // 判断是否已滚动离开顶部（用于切换透明度/阴影）
  isScrolled.value = currentScrollTop > 0

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

// ================= 搜索逻辑 =================
const searchKeyword = ref('')
const searchType = ref('problem') 
const searchInputFocused = ref(false) // 搜索框聚焦状态

watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/contest')) {
    searchType.value = 'contest'
  } else {
    searchType.value = 'problem'
  }
})

const handleGlobalSearch = () => {
  if (!searchKeyword.value.trim()) return
  router.push({
    path: searchType.value === 'problem' ? '/problem' : '/contest',
    query: { keyword: searchKeyword.value }
  })
}
</script>

<template>
  <el-header 
    class="global-header" 
    :class="{ 
      'header-hidden': isHidden,
      'header-scrolled': isScrolled 
    }"
  >
    <div class="header-glass-bg"></div> <div class="header-content">
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
            <span>题库</span>
          </el-menu-item>
          <el-menu-item index="/contest">
            <el-icon><Trophy /></el-icon>
            <span>竞赛</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="header-center">
        <div 
          class="search-capsule" 
          :class="{ 'is-focused': searchInputFocused }"
        >
          <el-dropdown trigger="click" @command="(val: string) => searchType = val">
            <div class="search-type-trigger">
              {{ searchType === 'problem' ? '题目' : '竞赛' }}
              <el-icon class="icon-arrow"><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="problem">题目</el-dropdown-item>
                <el-dropdown-item command="contest">竞赛</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <div class="divider-vertical"></div>

          <input 
            v-model="searchKeyword"
            class="native-input"
            type="text"
            placeholder="搜索感兴趣的内容..."
            @focus="searchInputFocused = true"
            @blur="searchInputFocused = false"
            @keyup.enter="handleGlobalSearch"
          />

          <div class="search-btn" @click="handleGlobalSearch">
            <el-icon><Search /></el-icon>
          </div>
        </div>
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
                <el-dropdown-item divided :icon="User" @click="router.push('/center')">个人中心</el-dropdown-item>
                <!-- <el-dropdown-item :icon="Edit" @click="router.push('/center')">修改资料</el-dropdown-item> -->
                <el-dropdown-item divided :icon="SwitchButton" @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" round class="login-btn" @click="router.push('/login')">登录 / 注册</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<style scoped lang="scss">
/* 变量定义 */
$header-height: 64px;
$primary-color: #409eff;
$text-main: #303133;
$text-light: #606266;

.global-header {
  padding: 0;
  height: $header-height;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: transform 0.3s ease-in-out;
  background: transparent; /* 重要：让背景层负责颜色 */
}

/* 毛玻璃背景层 */
.header-glass-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(255, 255, 255, 0.7); /* 半透明白 */
  backdrop-filter: blur(12px); /* 核心：毛玻璃模糊 */
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  z-index: -1;
}

/* 滚动时的效果增强 */
.header-scrolled .header-glass-bg {
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-bottom-color: transparent;
}

.header-hidden { 
  transform: translateY(-100%); 
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

/* Left: Logo & Nav */
.header-left { display: flex; align-items: center; height: 100%; }

.logo {
  margin-right: 48px;
  cursor: pointer;
  
  .logo-text {
    font-size: 22px;
    font-weight: 800;
    font-family: 'PingFang SC', 'Helvetica Neue', sans-serif;
    /* 高级渐变色 Logo */
    background: linear-gradient(120deg, #409eff 0%, #3079ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }
}

/* 导航菜单改造 - 去除底色，增加呼吸感 */
.nav-menu {
  border-bottom: none !important;
  background: transparent !important;
  height: $header-height;
  
  :deep(.el-menu-item) {
    height: $header-height;
    line-height: $header-height;
    font-size: 15px;
    font-weight: 500;
    color: $text-light;
    background: transparent !important;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
    
    &:hover {
      color: $primary-color !important;
      background: rgba(64, 158, 255, 0.04) !important;
    }
    
    &.is-active {
      color: $primary-color !important;
      font-weight: 600;
      border-bottom-color: $primary-color !important;
    }
    
    .el-icon { margin-right: 4px; }
  }
}

/* Center: 搜索栏 (胶囊风格) */
.header-center { 
  flex: 1; 
  display: flex; 
  justify-content: center; 
  max-width: 420px; 
  margin: 0 20px;
}

.search-capsule {
  width: 100%;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.04); /* 浅灰底 */
  border-radius: 99px; /* 胶囊圆角 */
  display: flex;
  align-items: center;
  padding: 0 4px 0 16px;
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  /* 聚焦时的光晕效果 */
  &.is-focused {
    background-color: #fff;
    border-color: rgba(64, 158, 255, 0.3);
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
    
    .native-input { width: 100%; }
  }
}

.search-type-trigger {
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  user-select: none;
  font-weight: 500;
  padding: 4px;
  
  &:hover { color: $primary-color; }
  .icon-arrow { font-size: 12px; margin-top: 1px; }
}

.divider-vertical {
  width: 1px;
  height: 14px;
  background-color: #dcdfe6;
  margin: 0 12px;
}

.native-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: $text-main;
  min-width: 0; /* 防止 Flex 溢出 */
  
  &::placeholder { color: #9da1a9; }
}

.search-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: $primary-color;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 8px;
  transition: transform 0.2s, background-color 0.2s;
  
  &:hover {
    background-color: #66b1ff;
    transform: scale(1.05);
  }
  &:active { transform: scale(0.95); }
}

/* Right: User */
.header-right { 
  display: flex; 
  align-items: center; 
  justify-content: flex-end;
  min-width: 100px;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: all 0.3s;
  border: 2px solid transparent;
  
  &:hover {
    border-color: rgba(64, 158, 255, 0.3);
    background-color: rgba(64, 158, 255, 0.1);
  }
}
.avatar { background: #f0f2f5; }

.login-btn {
  font-weight: 500;
  padding: 8px 24px;
  letter-spacing: 0.5px;
}

/* 下拉菜单样式复用 */
.dropdown-user-info { padding: 12px 16px; text-align: center; min-width: 150px; }
.u-nickname { font-size: 16px; font-weight: 600; color: #303133; margin-bottom: 4px; }
.u-desc { font-size: 12px; color: #909399; }
</style>