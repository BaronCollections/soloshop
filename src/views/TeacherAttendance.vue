<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Check, Close, Warning } from '@element-plus/icons-vue'
import type { AttendanceRecord, AttendanceStatus } from '../types/attendance'
import {
  ATTENDANCE_STATUS_OPTIONS,
  ATTENDANCE_STATUS_MAP,
  COURSE_OPTIONS
} from '../types/attendance'
import {
  getAttendanceRecords,
  saveAttendanceRecords,
  batchUpdateAttendanceStatus,
  getStudentsByClass
} from '../utils/attendanceStorage'
import { getClasses } from '../utils/classStorage'

const listLoading = ref(false)
const attendanceList = ref<AttendanceRecord[]>([])
const selectedIds = ref<string[]>([])

const searchForm = reactive({
  classId: 'class_1',
  course: 'all',
  date: '',
  status: 'all' as AttendanceStatus | 'all'
})

const classOptions = computed(() => {
  const classes = getClasses()
  return classes.map(c => ({ value: c.id, label: c.name }))
})

const courseFilterOptions = computed(() => [
  { value: 'all', label: '全部课程' },
  ...COURSE_OPTIONS.map(c => ({ value: c, label: c }))
])

const filteredList = computed(() => {
  let result = attendanceList.value

  if (searchForm.classId) {
    result = result.filter(item => item.classId === searchForm.classId)
  }

  if (searchForm.course && searchForm.course !== 'all') {
    result = result.filter(item => item.course === searchForm.course)
  }

  if (searchForm.date) {
    result = result.filter(item => item.date === searchForm.date)
  }

  if (searchForm.status && searchForm.status !== 'all') {
    result = result.filter(item => item.status === searchForm.status)
  }

  return result
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
    attendanceList.value = getAttendanceRecords()
    listLoading.value = false
  }, 300)
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.course = 'all'
  searchForm.date = ''
  searchForm.status = 'all'
  selectedIds.value = []
  loadData()
}

const handleSelectionChange = (selection: AttendanceRecord[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleBatchMark = (status: AttendanceStatus) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要标记的学生')
    return
  }

  const statusLabel = ATTENDANCE_STATUS_MAP[status].label
  ElMessageBox.confirm(
    `确定将选中的 ${selectedIds.value.length} 名学生标记为「${statusLabel}」吗？`,
    '批量标记确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      batchUpdateAttendanceStatus(selectedIds.value, status)
      loadData()
      selectedIds.value = []
      ElMessage.success(`批量标记成功，共 ${selectedIds.value.length} 人`)
    })
    .catch(() => {})
}

const handleMarkStatus = (row: AttendanceRecord, status: AttendanceStatus) => {
  const statusLabel = ATTENDANCE_STATUS_MAP[status].label
  ElMessageBox.confirm(
    `确定将「${row.studentName}」标记为「${statusLabel}」吗？`,
    '状态变更确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      const records = getAttendanceRecords()
      const index = records.findIndex(r => r.id === row.id)
      if (index > -1) {
        records[index] = {
          ...records[index],
          status,
          updatedAt: new Date().toISOString()
        }
        saveAttendanceRecords(records)
        loadData()
        ElMessage.success('状态更新成功')
      }
    })
    .catch(() => {})
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

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  })
}

onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  searchForm.date = today
  loadData()
})
</script>

<template>
  <div class="attendance-container">
    <div class="page-header">
      <h2 class="page-title">学生考勤管理</h2>
      <p class="page-subtitle">教师端考勤管理，支持按班级/课程/日期/状态筛选与批量标记</p>
    </div>

    <div class="stats-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <span class="stat-label">总人数</span>
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
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <span class="stat-label">出勤率</span>
          <span class="stat-value rate">{{ stats.attendanceRate }}%</span>
        </div>
      </el-card>
    </div>

    <div class="content-card">
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="班级">
            <el-select
              v-model="searchForm.classId"
              placeholder="请选择班级"
              style="width: 180px"
              @change="handleSearch"
            >
              <el-option
                v-for="item in classOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="课程">
            <el-select
              v-model="searchForm.course"
              placeholder="请选择课程"
              style="width: 160px"
            >
              <el-option
                v-for="item in courseFilterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="searchForm.date"
              type="date"
              placeholder="选择日期"
              style="width: 180px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
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
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <span class="total-count">共 {{ filteredList.length }} 条考勤记录</span>
          <span v-if="selectedIds.length > 0" class="selected-count">
            已选择 {{ selectedIds.length }} 项
          </span>
        </div>
        <div class="toolbar-right">
          <el-button :icon="Refresh" @click="loadData">
            刷新
          </el-button>
          <el-button
            type="success"
            :icon="Check"
            :disabled="selectedIds.length === 0"
            @click="handleBatchMark('present')"
          >
            批量标记出勤
          </el-button>
          <el-button
            type="warning"
            :icon="Warning"
            :disabled="selectedIds.length === 0"
            @click="handleBatchMark('late')"
          >
            批量标记迟到
          </el-button>
          <el-button
            type="danger"
            :icon="Close"
            :disabled="selectedIds.length === 0"
            @click="handleBatchMark('absent')"
          >
            批量标记缺勤
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="listLoading"
        :data="filteredList"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <template #empty>
          <el-empty
            :description="attendanceList.length === 0 ? '暂无考勤数据' : '没有符合筛选条件的记录'"
            :image-size="100"
          />
        </template>

        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="140" />
        <el-table-column prop="course" label="课程" width="120" />
        <el-table-column prop="date" label="日期" width="160">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="ATTENDANCE_STATUS_MAP[row.status].type" size="small">
              {{ ATTENDANCE_STATUS_MAP[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="success"
              link
              size="small"
              :disabled="row.status === 'present'"
              @click="handleMarkStatus(row, 'present')"
            >
              出勤
            </el-button>
            <el-button
              type="warning"
              link
              size="small"
              :disabled="row.status === 'late'"
              @click="handleMarkStatus(row, 'late')"
            >
              迟到
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              :disabled="row.status === 'absent'"
              @click="handleMarkStatus(row, 'absent')"
            >
              缺勤
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.attendance-container {
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
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

.stat-value.rate {
  color: #409eff;
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.total-count {
  font-size: 14px;
  color: #606266;
}

.selected-count {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}
</style>
