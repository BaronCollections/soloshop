import type { ClassInfo } from '../types/class'

const STORAGE_KEY = 'smart_campus_classes'

const defaultClasses: ClassInfo[] = [
  {
    id: 'class_1',
    name: '一年级(1)班',
    grade: '一年级',
    headTeacher: '张老师',
    studentCount: 45,
    classroom: '教学楼A101',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'class_2',
    name: '一年级(2)班',
    grade: '一年级',
    headTeacher: '李老师',
    studentCount: 42,
    classroom: '教学楼A102',
    createdAt: new Date(Date.now() - 86400000 * 28).toISOString()
  },
  {
    id: 'class_3',
    name: '二年级(1)班',
    grade: '二年级',
    headTeacher: '王老师',
    studentCount: 48,
    classroom: '教学楼A201',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 'class_4',
    name: '三年级(1)班',
    grade: '三年级',
    headTeacher: '刘老师',
    studentCount: 46,
    classroom: '教学楼A301',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
]

export const getClasses = (): ClassInfo[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      saveClasses(defaultClasses)
      return defaultClasses
    }
    return JSON.parse(data)
  } catch {
    return defaultClasses
  }
}

export const saveClasses = (classes: ClassInfo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes))
  } catch (error) {
    console.error('保存班级数据失败:', error)
  }
}

export const generateClassId = (): string => {
  return `class_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export const isClassNameDuplicate = (name: string, excludeId?: string): boolean => {
  const classes = getClasses()
  const trimmedName = name.trim()
  return classes.some(c => c.name.trim() === trimmedName && c.id !== excludeId)
}
