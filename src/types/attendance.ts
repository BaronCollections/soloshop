export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave'

export interface Student {
  id: string
  name: string
  studentNo: string
  classId: string
  className: string
  gender: 'male' | 'female'
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  studentNo: string
  classId: string
  className: string
  course: string
  date: string
  status: AttendanceStatus
  remark?: string
  createdAt: string
  updatedAt: string
}

export const ATTENDANCE_STATUS_OPTIONS: { value: AttendanceStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'present', label: '出勤' },
  { value: 'late', label: '迟到' },
  { value: 'absent', label: '缺勤' },
  { value: 'leave', label: '请假' }
]

export const ATTENDANCE_STATUS_MAP: Record<AttendanceStatus, { label: string; type: 'success' | 'warning' | 'danger' | 'info' }> = {
  present: { label: '出勤', type: 'success' },
  late: { label: '迟到', type: 'warning' },
  absent: { label: '缺勤', type: 'danger' },
  leave: { label: '请假', type: 'info' }
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
