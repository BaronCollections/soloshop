<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import type { LeaveApplication, LeaveStatus, LeaveType } from '../types/leave'
import {
  LEAVE_TYPE_OPTIONS,
  LEAVE_STATUS_OPTIONS,
  LEAVE_STATUS_MAP,
  COURSE_OPTIONS
} from '../types/leave'
import { getLeaveApplications, saveLeaveApplications, generateId } from '../utils/leaveStorage'

const listLoading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const currentStatus = ref<LeaveStatus | 'all'>('all')

const leaveList = ref<LeaveApplication[]>([])

const dialogFormRef = ref<FormInstance>()

const leaveForm = reactive({
  type: '' as LeaveType | '',
  startTime: '',
  endTime: '',
  course: '',
  reason: ''
})

const formRules: FormRules = {
  type: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  course: [{ required: true, message: '请选择关联课程', trigger: 'change' }],
  reason: [
    { required: true, message: '请输入请假原因', trigger: 'blur' },
    { min: 5, message: '请假原因至少5个字符', trigger: 'blur' }
  ]
}

const filteredList = computed(() => {
  if (currentStatus.value === 'all') {
    return leaveList.value
  }
  return leaveList.value.filter(item => item.status === currentStatus.value)
})

const loadData = () => {
  listLoading.value = true
  setTimeout(() => {
    leaveList.value = getLeaveApplications()
    listLoading.value = false
  }, 300)
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const resetForm = () => {
  leaveForm.type = ''
  leaveForm.startTime = ''
  leaveForm.endTime = ''
  leaveForm.course = ''
  leaveForm.reason = ''
  dialogFormRef.value?.clearValidate()
}

const validateTime = (): boolean => {
  if (leaveForm.startTime && leaveForm.endTime) {
    const start = new Date(leaveForm.startTime).getTime()
    const end = new Date(leaveForm.endTime).getTime()
    if (end <= start) {
      ElMessage.error('结束时间必须晚于开始时间')
      return false
    }
  }
  return true
}

const handleSubmit = async () => {
  if (!dialogFormRef.value) return

  if (!validateTime()) return

  await dialogFormRef.value.validate((valid) => {
    if (!valid) return

    submitLoading.value = true
    setTimeout(() => {
      const newApplication: LeaveApplication = {
        id: generateId(),
        type: leaveForm.type as LeaveType,
        startTime: leaveForm.startTime,
        endTime: leaveForm.endTime,
        course: leaveForm.course,
        reason: leaveForm.reason,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      leaveList.value.unshift(newApplication)
      saveLeaveApplications(leaveList.value)

      ElMessage.success('请假申请提交成功，状态为待审批')
      dialogVisible.value = false
      submitLoading.value = false
      resetForm()
    }, 500)
  })
}

const handleDelete = (row: LeaveApplication) => {
  ElMessageBox.confirm('确定要删除这条请假记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = leaveList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        leaveList.value.splice(index, 1)
        saveLeaveApplications(leaveList.value)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

const handleStatusChange = (status: LeaveStatus | 'all') => {
  currentStatus.value = status
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

const getLeaveTypeLabel = (type: LeaveType) => {
  return LEAVE_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type
}

const pickerOptions = {
  disabledDate(time: Date) {
    return time.getTime() < Date.now() - 8.64e7
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="leave-container">
    <div class="page-header">
      <h2 class="page-title">请假申请</h2>
      <p class="page-subtitle">学生端请假管理，支持申请、查询和状态跟踪</p>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-radio-group
            v-model="currentStatus"
            size="default"
            @change="handleStatusChange"
          >
            <el-radio-button
              v-for="item in LEAVE_STATUS_OPTIONS"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-right">
          <el-button :icon="Refresh" @click="loadData">
            刷新
          </el-button>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增请假
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="listLoading"
        :data="filteredList"
        style="width: 100%"
        stripe
      >
        <template #empty>
          <el-empty
            :description="leaveList.length === 0 ? '暂无请假记录' : '没有符合筛选条件的记录'"
            :image-size="100"
          />
        </template>
        <el-table-column prop="id" label="申请编号" width="200">
          <template #default="{ row }">
            <span class="text-mono">{{ row.id.slice(0, 18) }}...</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="请假类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getLeaveTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="course" label="关联课程" width="140" />
        <el-table-column prop="reason" label="请假原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="LEAVE_STATUS_MAP[row.status].type" size="small">
              {{ LEAVE_STATUS_MAP[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              撤销
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="新增请假申请"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="dialogFormRef"
        :model="leaveForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="请假类型" prop="type">
          <el-select
            v-model="leaveForm.type"
            placeholder="请选择请假类型"
            style="width: 100%"
          >
            <el-option
              v-for="item in LEAVE_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="leaveForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            :picker-options="pickerOptions"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="leaveForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            :picker-options="pickerOptions"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="关联课程" prop="course">
          <el-select
            v-model="leaveForm.course"
            placeholder="请选择关联课程"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="course in COURSE_OPTIONS"
              :key="course"
              :label="course"
              :value="course"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="leaveForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细描述请假原因（至少5个字符）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.leave-container {
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
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.text-mono {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
  font-size: 13px;
  color: #606266;
}
</style>
