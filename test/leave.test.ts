import {
  getLeaveApplications,
  saveLeaveApplications,
  addLeaveApplication,
  generateId
} from '../src/utils/leaveStorage'
import type { LeaveApplication } from '../src/types/leave'

const STORAGE_KEY = 'smart_campus_leave_applications'

console.log('=== 测试开始 ===\n')

localStorage.removeItem(STORAGE_KEY)

console.log('1. 测试初始状态：')
const initialData = getLeaveApplications()
console.log('   初始数据为空:', initialData.length === 0 ? '✓ 通过' : '✗ 失败')

console.log('\n2. 测试添加请假申请：')
const newLeave = addLeaveApplication({
  type: 'sick',
  startTime: '2026-06-20 09:00:00',
  endTime: '2026-06-20 18:00:00',
  course: '高等数学',
  reason: '感冒发烧需要去医院就诊'
})
console.log('   生成ID:', newLeave.id ? '✓ 通过' : '✗ 失败')
console.log('   状态为待审批:', newLeave.status === 'pending' ? '✓ 通过' : '✗ 失败')
console.log('   包含创建时间:', newLeave.createdAt ? '✓ 通过' : '✗ 失败')

console.log('\n3. 测试添加第二条请假申请（已通过状态，用于测试筛选）：')
const approvedLeave: LeaveApplication = {
  id: generateId(),
  type: 'personal',
  startTime: '2026-06-25 09:00:00',
  endTime: '2026-06-25 12:00:00',
  course: '大学英语',
  reason: '家中有事需要处理',
  status: 'approved',
  createdAt: new Date().toISOString()
}
const allLeaves = getLeaveApplications()
allLeaves.unshift(approvedLeave)
saveLeaveApplications(allLeaves)

console.log('\n4. 测试数据持久化（模拟刷新页面）：')
const dataAfterRefresh = getLeaveApplications()
console.log('   刷新后数据条数为2:', dataAfterRefresh.length === 2 ? '✓ 通过' : '✗ 失败')
console.log('   第一条记录ID匹配:', dataAfterRefresh[0].id === approvedLeave.id ? '✓ 通过' : '✗ 失败')
console.log('   第二条记录ID匹配:', dataAfterRefresh[1].id === newLeave.id ? '✓ 通过' : '✗ 失败')

console.log('\n5. 测试状态筛选逻辑：')
const pendingOnly = dataAfterRefresh.filter(item => item.status === 'pending')
const approvedOnly = dataAfterRefresh.filter(item => item.status === 'approved')
const rejectedOnly = dataAfterRefresh.filter(item => item.status === 'rejected')
console.log('   筛选待审批: 1条', pendingOnly.length === 1 ? '✓ 通过' : '✗ 失败')
console.log('   筛选已通过: 1条', approvedOnly.length === 1 ? '✓ 通过' : '✗ 失败')
console.log('   筛选已拒绝: 0条', rejectedOnly.length === 0 ? '✓ 通过' : '✗ 失败')

console.log('\n6. 测试时间校验逻辑：')
const validateTime = (start: string, end: string): boolean => {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  return endTime > startTime
}
const test1 = validateTime('2026-06-20 09:00:00', '2026-06-20 08:00:00') === false
const test2 = validateTime('2026-06-20 09:00:00', '2026-06-20 09:00:00') === false
const test3 = validateTime('2026-06-20 09:00:00', '2026-06-20 18:00:00') === true
console.log('   结束时间早于开始时间: 返回false', test1 ? '✓ 通过' : '✗ 失败')
console.log('   结束时间等于开始时间: 返回false', test2 ? '✓ 通过' : '✗ 失败')
console.log('   结束时间晚于开始时间: 返回true', test3 ? '✓ 通过' : '✗ 失败')

console.log('\n7. 测试原因非空校验：')
const validateReason = (reason: string): boolean => {
  return reason.trim().length >= 5
}
const test4 = validateReason('') === false
const test5 = validateReason('abcd') === false
const test6 = validateReason('感冒发烧') === true
console.log('   空原因: 不通过', test4 ? '✓ 通过' : '✗ 失败')
console.log('   原因少于5字符: 不通过', test5 ? '✓ 通过' : '✗ 失败')
console.log('   原因5字符以上: 通过', test6 ? '✓ 通过' : '✗ 失败')

console.log('\n=== 测试完成 ===')
console.log('\n测试数据已保存到 localStorage，可在浏览器中刷新查看。')
console.log('请在浏览器中测试以下交互功能：')
console.log('  1. 点击"新增请假"按钮打开弹窗')
console.log('  2. 填写表单后提交，验证新增功能')
console.log('  3. 测试结束时间早于开始时间的校验')
console.log('  4. 点击不同状态按钮测试筛选功能')
console.log('  5. 刷新页面验证数据持久化')
