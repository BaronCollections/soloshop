export interface ClassInfo {
  id: string
  name: string
  grade: string
  headTeacher: string
  studentCount: number
  classroom: string
  createdAt: string
}

export const GRADE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部年级' },
  { value: '一年级', label: '一年级' },
  { value: '二年级', label: '二年级' },
  { value: '三年级', label: '三年级' },
  { value: '四年级', label: '四年级' },
  { value: '五年级', label: '五年级' },
  { value: '六年级', label: '六年级' },
  { value: '初一', label: '初一' },
  { value: '初二', label: '初二' },
  { value: '初三', label: '初三' },
  { value: '高一', label: '高一' },
  { value: '高二', label: '高二' },
  { value: '高三', label: '高三' }
]

export const HEAD_TEACHER_OPTIONS = [
  '张老师',
  '李老师',
  '王老师',
  '刘老师',
  '陈老师',
  '杨老师',
  '赵老师',
  '黄老师',
  '周老师',
  '吴老师'
]
