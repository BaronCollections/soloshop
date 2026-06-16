<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Menu,
  User,
  Calendar,
  DataLine,
  Document,
  SwitchButton
} from '@element-plus/icons-vue'
import { currentUser, setCurrentUser } from '../stores/userStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

const user = computed(() => currentUser.value)

const menuItems = computed(() => {
  const items: { index: string; label: string; icon: any }[] = []

  items.unshift({ index: '/dashboard', label: '首页', icon: User })

  if (user.value?.role === 'admin') {
    items.push(
      { index: '/admin/attendance', label: '考勤统计', icon: DataLine },
      { index: '/class-management', label: '班级管理', icon: Menu }
    )
  }

  if (user.value?.role === 'teacher') {
    items.push(
      { index: '/teacher/attendance', label: '考勤管理', icon: Calendar },
      { index: '/class-management', label: '班级管理', icon: Menu }
    )
  }

  if (user.value?.role === 'student') {
    items.push(
      { index: '/student/attendance', label: '我的考勤', icon: Calendar },
      { index: '/student/leave', label: '请假申请', icon: Document }
    )
  }

  return items
})

const activeMenu = computed(() => route.path)

const handleMenuSelect = (index: string) => {
  router.push(index)
}

const handleLogout = () => {
  setCurrentUser(null)
  ElMessage.success('已退出登录')
  router.push('/login')
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo-area">
        <h1 class="logo-text" v-show="!isCollapse">智慧校园</h1>
        <h1 class="logo-text-mini" v-show="isCollapse">智</h1>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.index"
          :index="item.index"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.label }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="Menu"
            circle
            size="small"
            @click="toggleCollapse"
          />
        </div>

        <div class="header-right">
          <el-dropdown @command="handleLogout">
            <span class="user-info">
              <el-avatar :size="32" class="user-avatar">
                {{ user?.name?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ user?.name }}</span>
              <el-tag
                size="small"
                :type="user?.role === 'admin' ? 'danger' : user?.role === 'teacher' ? 'warning' : 'success'"
              >
                {{ user?.roleLabel }}
              </el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" :icon="SwitchButton">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b3a4f;
  border-bottom: 1px solid #1f2d3d;
}

.logo-text {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2px;
}

.logo-text-mini {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 60px);
}

.sidebar-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: #263445;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #409eff;
  color: #fff;
}

.header {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.main-content {
  padding: 0;
  background: #f5f7fa;
  overflow-y: auto;
}
</style>
