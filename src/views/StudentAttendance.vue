<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { AttendanceRecord, AttendanceStatus } from '../types/attendance'
import { ATTENDANCE_STATUS_OPTIONS, ATTENDANCE_STATUS_MAP } from '../types/attendance'
import { getAttendanceRecords } from '../utils/attendanceStorage'

const listLoading = ref(false)
const attendanceList = ref<AttendanceRecord[]>([])

const searchForm = reactive({
  dateRange: [] as string[],
  status: 'all' as AttendanceStatus | 'all',
  course: 'all'
})

const studentInfo = reactive({
  name: '张同学',
  studentNo: '2024001',
  className: '一年级(1)班'
})

const courseOptions = computed(() => {
  const courses = new Set<string>()
  attendanceList.value.forEach(r => courses.add(r.course))
  return [
    { value: 'all', label: '全部课程' },
    ...Array.from(courses).map(c => ({ value: c, label: c }))
  ]
})

const filteredList = computed(() => {
  let result = attendanceList.value

  if (searchForm.status && searchForm.status !== 'all') {
    result = result.filter(item => item.status === searchForm.status)
  }

  if (searchForm.course && searchForm.course !== 'all') {
    result = result.filter(item => item.course === searchForm.course)
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange
    result = result.filter(item => item.date >= startDate && item.date <= endDate)
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const stats = computed(() => {
  const list = filteredList.value
  const total = list.length
  const present = list.filter(i => i.status === 'present').length
  const late = list.filter(i => i.status === 'late').length
  const absent = list.filter(i => i.status === 'absent').length
  const leave = list.filter(i => i.status === 'leave').length
  const attendanceRate = total > 0 ? ((present + leave) / total * 100).toFixed(1) : '0.0'

  return { total, present, late, absent, leave, attendanceRate }
})

const loadData = () => {
  listLoading.value = true
  setTimeout(() => {
    const allRecords = getAttendanceRecords()
    attendanceList.value = allRecords.filter(r => r.studentNo === '2024001')
    listLoading.value = false
  }, 300)
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.status = 'all'
  searchForm.course = 'all'
  loadData()
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  })
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  const today = new Date()
  const monthAgo = new Date(today)
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  searchForm.dateRange = [
    monthAgo.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  ]
  loadData()
})
</script>

<template>
  <div class="student-attendance-container">
    <div class="page-header">
      <h2 class="page-title">我的考勤</h2>
      <p class="page-subtitle">查看个人考勤记录，了解出勤情况</p>
    </div>

    <el-card shadow="hover" class="student-info-card">
      <div class="student-info">
        <el-avatar :size="64" class="student-avatar">
          {{ studentInfo.name.charAt(0) }}
        </el-avatar>
        <div class="info-detail">
          <h3 class="student-name">{{ studentInfo.name }}</h3>
          <p class="info-item">
            <span class="label">学号：</span>
            <span class="value">{{ studentInfo.studentNo }}</span>
          </p>
          <p class="info-item">
            <span class="label">班级：</span>
            <span class="value">{{ studentInfo.className }}</span>
          </p>
        </div>
        <div class="stats-summary">
          <div class="summary-item">
            <span class="summary-value rate">{{ stats.attendanceRate }}%</span>
            <span class="summary-label">出勤率</span>
          </div>
        </div>
      </div>
    </el-card>

    <div class="stats-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <span class="stat-label">总记录</span>
          <span class="stat-value total">{{ stats.total }}</span>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <span class="stat-label">出勤</span>
          <span class="stat-value present">{{ stats.present }}</span>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <span class="stat-label">迟到</span>
          <span class="stat-value late">{{ stats.late }}</span>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <span class="stat-label">缺勤</span>
          <span class="stat-value absent">{{ stats.absent }}</span>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <span class="stat-label">请假</span>
          <span class="stat-value leave">{{ stats.leave }}</span>
        </div>
      </el-card>
    </div>

    <div class="content-card">
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 320px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="课程">
            <el-select
              v-model="searchForm.course"
              placeholder="请选择课程"
              style="width: 160px"
            >
              <el-option
                v-for="item in courseOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              style="width: 140px"
            >
              <el-option
                v-for="item in ATTENDANCE_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select
            >
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        v-loading="listLoading"
        :data="filteredList"
        style="width: 100%"
        stripe
      >
        <template #empty>
          <el-empty
            :description="attendanceList.length === 0 ? '暂无考勤记录' : '没有符合筛选条件的记录'"
            :image-size="100"
          />
        </template>

        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="date" label="日期" width="160">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="course" label="课程" width="140" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="ATTENDANCE_STATUS_MAP[row.status].type" size="small">
              {{ ATTENDANCE_STATUS_MAP[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.student-attendance-container {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.student-info-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.student-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 24px;
  font-weight: 600;
}

.info-detail {
  flex: 1;
}

.student-name {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.info-item {
  margin: 4px 0;
  font-size: 14px;
}

.info-item .label {
  color: #909399;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}

.stats-summary {
  text-align: center;
  padding: 0 24px;
  border-left: 1px solid #ebeef5;
}

.summary-value {
  display: block;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 4px;
}

.summary-value.rate {
  color: #67c23a;
}

.summary-label {
  font-size: 14px;
  color: #909399;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
}

.stat-value.total {
  color: #303133;
}

.stat-value.present {
  color: #67c23a;
}

.stat-value.late {
  color: #e6a23c;
}

.stat-value.absent {
  color: #f56c6c;
}

.stat-value.leave {
  color: #909399;
}

.content-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-bar {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.search-bar :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
