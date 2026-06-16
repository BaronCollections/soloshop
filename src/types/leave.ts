export type LeaveType = 'sick' | 'personal' | 'other'

export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveApplication {
  id: string
  type: LeaveType
  startTime: string
  endTime: string
  course: string
  reason: string
  status: LeaveStatus
  createdAt: string
}

export const LEAVE_TYPE_OPTIONS: { value: LeaveType; label: string }[] = [
  { value: 'sick', label: '病假' },
  { value: 'personal', label: '事假' },
  { value: 'other', label: '其他' }
]

export const LEAVE_STATUS_OPTIONS: { value: LeaveStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' }
]

export const LEAVE_STATUS_MAP: Record<LeaveStatus, { label: string; type: 'warning' | 'success' | 'danger' }> = {
  pending: { label: '待审批', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' }
}

export const COURSE_OPTIONS = [
  '高等数学',
  '大学英语',
  '计算机基础',
  '数据结构',
  '操作系统',
  '计算机网络',
  '软件工程',
  '数据库原理'
]
