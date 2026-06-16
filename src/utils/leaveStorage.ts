import type { LeaveApplication } from '../types/leave'

const STORAGE_KEY = 'smart_campus_leave_applications'

export const getLeaveApplications = (): LeaveApplication[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const saveLeaveApplications = (applications: LeaveApplication[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  } catch (error) {
    console.error('保存请假数据失败:', error)
  }
}

export const addLeaveApplication = (application: Omit<LeaveApplication, 'id' | 'createdAt' | 'status'>): LeaveApplication => {
  const applications = getLeaveApplications()
  const newApplication: LeaveApplication = {
    ...application,
    id: `leave_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  applications.unshift(newApplication)
  saveLeaveApplications(applications)
  return newApplication
}

export const generateId = (): string => {
  return `leave_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
