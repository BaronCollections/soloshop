<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, TrendUp, Warning, User } from '@element-plus/icons-vue'
import type { AttendanceRecord } from '../types/attendance'
import { ATTENDANCE_STATUS_MAP } from '../types/attendance'
import { getAttendanceRecords } from '../utils/attendanceStorage'
import { getClasses } from '../utils/classStorage'

const listLoading = ref(false)
const attendanceList = ref<AttendanceRecord[]>([])

const searchForm = reactive({
  dateRange: [] as string[],
  classId: 'all'
})

const classOptions = computed(() => {
  const classes = getClasses()
  return [
    { value: 'all', label: '全部班级' },
    ...classes.map(c => ({ value: c.id, label: c.name }))
  ]
})

const overallStats = computed(() => {
  const list = filteredList.value
  const total = list.length
  const present = list.filter(i => i.status === 'present').length
  const late = list.filter(i => i.status === 'late').length
  const absent = list.filter(i => i.status === 'absent').length
  const leave = list.filter(i => i.status === 'leave').length
  const attendanceRate = total > 0 ? ((present + leave) / total * 100).toFixed(1) : '0.0'
  const lateRate = total > 0 ? (late / total * 100).toFixed(1) : '0.0'
  const absentRate = total > 0 ? (absent / total * 100).toFixed(1) : '0.0'

  return { total, present, late, absent, leave, attendanceRate, lateRate, absentRate }
})

const classStats = computed(() => {
  const list = filteredList.value
  const classMap = new Map<string, {
    className: string
    total: number
    present: number
    late: number
    absent: number
    leave: number
    attendanceRate: string
  }>()

  list.forEach(record => {
    if (!classMap.has(record.classId)) {
      classMap.set(record.classId, {
        className: record.className,
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        attendanceRate: '0.0'
      })
    }
    const stats = classMap.get(record.classId)!
    stats.total++
    if (record.status === 'present') stats.present++
    else if (record.status === 'late') stats.late++
    else if (record.status === 'absent') stats.absent++
    else if (record.status === 'leave') stats.leave++
  })

  const result = Array.from(classMap.values()).map(s => ({
    ...s,
    attendanceRate: s.total > 0 ? ((s.present + s.leave) / s.total * 100).toFixed(1) : '0.0'
  }))

  result.sort((a, b) => parseFloat(b.attendanceRate) - parseFloat(a.attendanceRate))
  return result
})

const abnormalStudents = computed(() => {
  const list = filteredList.value
  const studentMap = new Map<string, {
    studentId: string
    studentName: string
    studentNo: string
    className: string
    lateCount: number
    absentCount: number
    abnormalCount: number
  }>()

  list.forEach(record => {
    if (record.status === 'late' || record.status === 'absent') {
      if (!studentMap.has(record.studentId)) {
        studentMap.set(record.studentId, {
          studentId: record.studentId,
          studentName: record.studentName,
          studentNo: record.studentNo,
          className: record.className,
          lateCount: 0,
          absentCount: 0,
          abnormalCount: 0
        })
      }
      const stats = studentMap.get(record.studentId)!
      if (record.status === 'late') stats.lateCount++
      if (record.status === 'absent') stats.absentCount++
      stats.abnormalCount++
    }
  })

  const result = Array.from(studentMap.values())
  result.sort((a, b) => b.abnormalCount - a.abnormalCount)
  return result.slice(0, 10)
})

const filteredList = computed(() => {
  let result = attendanceList.value

  if (searchForm.classId && searchForm.classId !== 'all') {
    result = result.filter(item => item.classId === searchForm.classId)
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange
    result = result.filter(item => item.date >= startDate && item.date <= endDate)
  }

  return result
})

const loadData = () => {
  listLoading.value = true
  setTimeout(() => {
    attendanceList.value = getAttendanceRecords()
    listLoading.value = false
  }, 300)
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.classId = 'all'
  loadData()
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getRankBadge = (index: number) => {
  if (index === 0) return { type: 'danger', text: 'NO.1' }
  if (index === 1) return { type: 'warning', text: 'NO.2' }
  if (index === 2) return { type: 'primary', text: 'NO.3' }
  return { type: 'info', text: `${index + 1}` }
}

onMounted(() => {
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  searchForm.dateRange = [
    weekAgo.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  ]
  loadData()
})
</script>

<template>
  <div class="admin-attendance-container">
    <div class="page-header">
      <h2 class="page-title">全校考勤统计</h2>
      <p class="page-subtitle">管理员端考勤数据分析，支持全校统计与异常学生排行</p>
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
              style="width: 360px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="班级">
            <el-select
              v-model="searchForm.classId"
              placeholder="请选择班级"
              style="width: 180px"
            >
              <el-option
                v-for="item in classOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="stats-cards">
      <el-card shadow="hover" class="stat-card primary">
        <div class="stat-icon">
          <el-icon :size="32"><TrendUp /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ overallStats.attendanceRate }}%</span>
          <span class="stat-label">整体出勤率</span>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card success">
        <div class="stat-icon">
          <el-icon :size="32"><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ overallStats.present }}</span>
          <span class="stat-label">出勤人次</span>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card warning">
        <div class="stat-icon">
          <el-icon :size="32"><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ overallStats.late }}</span>
          <span class="stat-label">迟到人次</span>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card danger">
        <div class="stat-icon">
          <el-icon :size="32"><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ overallStats.absent }}</span>
          <span class="stat-label">缺勤人次</span>
        </div>
      </el-card>
    </div>

    <div class="content-row">
      <el-card shadow="hover" class="content-card-half">
        <template #header>
          <div class="card-header">
            <span class="card-title">班级出勤率排名</span>
          </div>
        </template>

        <el-table
          v-loading="listLoading"
          :data="classStats"
          style="width: 100%"
          stripe
        >
          <template #empty>
            <el-empty description="暂无班级数据" :image-size="80" />
          </template>

          <el-table-column type="index" label="排名" width="70" align="center">
            <template #default="{ $index }">
              <el-tag
                v-if="$index < 3"
                :type="getRankBadge($index).type"
                size="small"
                effect="dark"
              >
                {{ getRankBadge($index).text }}
              </el-tag>
              <span v-else class="rank-num">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="className" label="班级" min-width="140" />
          <el-table-column prop="total" label="总人次" width="90" align="center" />
          <el-table-column prop="attendanceRate" label="出勤率" width="100" align="center">
            <template #default="{ row }">
              <span class="rate-text">{{ row.attendanceRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="出勤分布" min-width="200">
            <template #default="{ row }">
              <div class="dist-bar">
                <div
                  class="dist-segment present"
                  :style="{ width: row.total > 0 ? (row.present / row.total * 100) + '%' : '0%' }"
                  :title="`出勤: ${row.present}`"
                />
                <div
                  class="dist-segment late"
                  :style="{ width: row.total > 0 ? (row.late / row.total * 100) + '%' : '0%' }"
                  :title="`迟到: ${row.late}`"
                />
                <div
                  class="dist-segment absent"
                  :style="{ width: row.total > 0 ? (row.absent / row.total * 100) + '%' : '0%' }"
                  :title="`缺勤: ${row.absent}`"
                />
                <div
                  class="dist-segment leave"
                  :style="{ width: row.total > 0 ? (row.leave / row.total * 100) + '%' : '0%' }"
                  :title="`请假: ${row.leave}`"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="hover" class="content-card-half">
        <template #header>
          <div class="card-header">
            <span class="card-title">异常学生排行 TOP 10</span>
            <el-tag type="danger" size="small">迟到+缺勤</el-tag>
          </div>
        </template>

        <el-table
          v-loading="listLoading"
          :data="abnormalStudents"
          style="width: 100%"
          stripe
        >
          <template #empty>
            <el-empty description="暂无异常学生数据" :image-size="80" />
          </template>

          <el-table-column type="index" label="排名" width="70" align="center">
            <template #default="{ $index }">
              <el-tag
                v-if="$index < 3"
                :type="getRankBadge($index).type"
                size="small"
                effect="dark"
              >
                {{ getRankBadge($index).text }}
              </el-tag>
              <span v-else class="rank-num">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="studentNo" label="学号" width="100" />
          <el-table-column prop="studentName" label="姓名" width="90" />
          <el-table-column prop="className" label="班级" min-width="120" />
          <el-table-column prop="lateCount" label="迟到" width="70" align="center">
            <template #default="{ row }">
              <el-tag type="warning" size="small">{{ row.lateCount }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="absentCount" label="缺勤" width="70" align="center">
            <template #default="{ row }">
              <el-tag type="danger" size="small">{{ row.absentCount }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="abnormalCount" label="异常次数" width="90" align="center">
            <template #default="{ row }">
              <span class="abnormal-count">{{ row.abnormalCount }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.admin-attendance-container {
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

.content-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 0;
}

.search-bar :deep(.el-form-item) {
  margin-bottom: 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
}

.stat-card.danger .stat-icon {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.content-card-half {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.rank-num {
  font-size: 14px;
  color: #909399;
}

.rate-text {
  font-weight: 600;
  color: #67c23a;
}

.abnormal-count {
  font-weight: 600;
  color: #f56c6c;
  font-size: 16px;
}

.dist-bar {
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
  background: #f0f2f5;
}

.dist-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.dist-segment.present {
  background: #67c23a;
}

.dist-segment.late {
  background: #e6a23c;
}

.dist-segment.absent {
  background: #f56c6c;
}

.dist-segment.leave {
  background: #909399;
}
</style>
