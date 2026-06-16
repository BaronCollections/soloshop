import type { Student, AttendanceRecord, AttendanceStatus } from '../types/attendance'

const STUDENTS_KEY = 'smart_campus_students'
const ATTENDANCE_KEY = 'smart_campus_attendance'

const defaultStudents: Student[] = [
  { id: 'stu_001', name: '张伟', studentNo: '2024001', classId: 'class_1', className: '一年级(1)班', gender: 'male' },
  { id: 'stu_002', name: '王芳', studentNo: '2024002', classId: 'class_1', className: '一年级(1)班', gender: 'female' },
  { id: 'stu_003', name: '李娜', studentNo: '2024003', classId: 'class_1', className: '一年级(1)班', gender: 'female' },
  { id: 'stu_004', name: '刘洋', studentNo: '2024004', classId: 'class_1', className: '一年级(1)班', gender: 'male' },
  { id: 'stu_005', name: '陈静', studentNo: '2024005', classId: 'class_1', className: '一年级(1)班', gender: 'female' },
  { id: 'stu_006', name: '杨帆', studentNo: '2024006', classId: 'class_1', className: '一年级(1)班', gender: 'male' },
  { id: 'stu_007', name: '赵敏', studentNo: '2024007', classId: 'class_1', className: '一年级(1)班', gender: 'female' },
  { id: 'stu_008', name: '黄磊', studentNo: '2024008', classId: 'class_1', className: '一年级(1)班', gender: 'male' },
  { id: 'stu_009', name: '周婷', studentNo: '2024009', classId: 'class_2', className: '一年级(2)班', gender: 'female' },
  { id: 'stu_010', name: '吴强', studentNo: '2024010', classId: 'class_2', className: '一年级(2)班', gender: 'male' },
  { id: 'stu_011', name: '郑丽', studentNo: '2024011', classId: 'class_2', className: '一年级(2)班', gender: 'female' },
  { id: 'stu_012', name: '孙浩', studentNo: '2024012', classId: 'class_2', className: '一年级(2)班', gender: 'male' },
  { id: 'stu_013', name: '马琳', studentNo: '2024013', classId: 'class_3', className: '二年级(1)班', gender: 'female' },
  { id: 'stu_014', name: '朱杰', studentNo: '2024014', classId: 'class_3', className: '二年级(1)班', gender: 'male' },
  { id: 'stu_015', name: '胡雪', studentNo: '2024015', classId: 'class_3', className: '二年级(1)班', gender: 'female' },
  { id: 'stu_016', name: '林涛', studentNo: '2024016', classId: 'class_4', className: '三年级(1)班', gender: 'male' },
  { id: 'stu_017', name: '何雨', studentNo: '2024017', classId: 'class_4', className: '三年级(1)班', gender: 'female' },
  { id: 'stu_018', name: '罗阳', studentNo: '2024018', classId: 'class_4', className: '三年级(1)班', gender: 'male' }
]

const generateDefaultAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = []
  const today = new Date()
  const courses = ['高等数学', '大学英语', '计算机基础']

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)
    const dateStr = date.toISOString().split('T')[0]

    if (date.getDay() === 0 || date.getDay() === 6) continue

    courses.forEach((course, courseIdx) => {
      defaultStudents.forEach((student, stuIdx) => {
        const random = Math.random()
        let status: AttendanceStatus = 'present'

        if (dayOffset === 0 && stuIdx < 3) {
          status = 'present'
        } else if (random < 0.08) {
          status = 'absent'
        } else if (random < 0.15) {
          status = 'late'
        } else if (random < 0.18) {
          status = 'leave'
        }

        records.push({
          id: `att_${dateStr}_${courseIdx}_${student.id}`,
          studentId: student.id,
          studentName: student.name,
          studentNo: student.studentNo,
          classId: student.classId,
          className: student.className,
          course,
          date: dateStr,
          status,
          remark: status === 'leave' ? '请假中' : '',
          createdAt: new Date(date.getTime() + courseIdx * 3600000).toISOString(),
          updatedAt: new Date(date.getTime() + courseIdx * 3600000).toISOString()
        })
      })
    })
  }

  return records
}

export const getStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(STUDENTS_KEY)
    if (!data) {
      saveStudents(defaultStudents)
      return defaultStudents
    }
    return JSON.parse(data)
  } catch {
    return defaultStudents
  }
}

export const saveStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students))
  } catch (error) {
    console.error('保存学生数据失败:', error)
  }
}

export const getStudentsByClass = (classId: string): Student[] => {
  return getStudents().filter(s => s.classId === classId)
}

export const getAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const data = localStorage.getItem(ATTENDANCE_KEY)
    if (!data) {
      const defaultRecords = generateDefaultAttendance()
      saveAttendanceRecords(defaultRecords)
      return defaultRecords
    }
    return JSON.parse(data)
  } catch {
    return generateDefaultAttendance()
  }
}

export const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
  try {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records))
  } catch (error) {
    console.error('保存考勤数据失败:', error)
  }
}

export const updateAttendanceStatus = (
  recordId: string,
  status: AttendanceStatus,
  remark?: string
): AttendanceRecord | null => {
  const records = getAttendanceRecords()
  const index = records.findIndex(r => r.id === recordId)
  if (index > -1) {
    records[index] = {
      ...records[index],
      status,
      remark: remark || records[index].remark,
      updatedAt: new Date().toISOString()
    }
    saveAttendanceRecords(records)
    return records[index]
  }
  return null
}

export const batchUpdateAttendanceStatus = (
  recordIds: string[],
  status: AttendanceStatus,
  remark?: string
): number => {
  const records = getAttendanceRecords()
  let count = 0
  recordIds.forEach(id => {
    const index = records.findIndex(r => r.id === id)
    if (index > -1) {
      records[index] = {
        ...records[index],
        status,
        remark: remark || records[index].remark,
        updatedAt: new Date().toISOString()
      }
      count++
    }
  })
  saveAttendanceRecords(records)
  return count
}

export const getAttendanceByClassAndDate = (
  classId: string,
  date: string,
  course?: string
): AttendanceRecord[] => {
  let records = getAttendanceRecords().filter(r => r.classId === classId && r.date === date)
  if (course) {
    records = records.filter(r => r.course === course)
  }
  return records
}

export const generateAttendanceId = (): string => {
  return `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
