<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Document, DataLine, Menu } from '@element-plus/icons-vue'
import { currentUser } from '../stores/userStore'

const router = useRouter()

const user = computed(() => currentUser.value!)

const quickLinks = computed(() => {
  if (user.value.role === 'admin') {
    return [
      { title: '考勤统计', desc: '查看全校考勤数据分析', icon: DataLine, path: '/admin/attendance', color: 'primary' },
      { title: '班级管理', desc: '管理班级信息', icon: Menu, path: '/class-management', color: 'success' }
    ]
  }

  if (user.value.role === 'teacher') {
    return [
      { title: '考勤管理', desc: '学生考勤与批量标记', icon: Calendar, path: '/teacher/attendance', color: 'primary' },
      { title: '班级管理', desc: '查看班级信息', icon: Menu, path: '/class-management', color: 'success' }
    ]
  }

  return [
    { title: '我的考勤', desc: '查看个人考勤记录', icon: Calendar, path: '/student/attendance', color: 'primary' },
    { title: '请假申请', desc: '提交与管理请假申请', icon: Document, path: '/student/leave', color: 'warning' }
  ]
})

const handleNavigate = (path: string) => {
  router.push(path)
}

const welcomeText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h2 class="welcome-title">{{ welcomeText }}，{{ user.name }} 👋</h2>
      <p class="welcome-desc">
        欢迎使用智慧校园管理系统，您当前的角色是
        <el-tag :type="user.role === 'admin' ? 'danger' : user.role === 'teacher' ? 'warning' : 'success'">
          {{ user.roleLabel }}
        </el-tag>
      </p>
    </div>

    <div class="quick-links">
      <el-card
        v-for="(link, index) in quickLinks"
        :key="index"
        shadow="hover"
        class="quick-card"
        :class="`quick-card-${link.color}`"
        @click="handleNavigate(link.path)"
      >
        <div class="quick-content">
          <div class="quick-icon">
            <el-icon :size="32"><component :is="link.icon" /></el-icon>
          </div>
          <div class="quick-info">
            <h3 class="quick-title">{{ link.title }}</h3>
            <p class="quick-desc">{{ link.desc }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <el-card shadow="hover" class="info-card">
      <template #header>
        <span class="card-title">系统说明</span>
      </template>
      <div class="info-content">
        <div class="info-item">
          <el-icon><Calendar /></el-icon>
          <span>学生考勤与请假闭环管理系统</span>
        </div>
        <div class="info-item">
          <el-icon><DataLine /></el-icon>
          <span>支持教师考勤管理、学生请假申请、管理员统计分析</span>
        </div>
        <div class="info-item">
          <el-icon><Document /></el-icon>
          <span>所有数据本地存储，状态变更即时生效</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.welcome-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.quick-card {
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.quick-card:hover {
  transform: translateY(-4px);
}

.quick-card :deep(.el-card__body) {
  padding: 24px;
}

.quick-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quick-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.quick-card-primary .quick-icon {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.quick-card-success .quick-icon {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.quick-card-warning .quick-icon {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
}

.quick-card-danger .quick-icon {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.quick-info {
  flex: 1;
  min-width: 0;
}

.quick-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.quick-desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.info-card {
  border-radius: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #606266;
}

.info-item .el-icon {
  color: #409eff;
  font-size: 18px;
}
</style>
