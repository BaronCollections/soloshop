global.localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, val) { this.data[key] = val; },
  removeItem(key) { delete this.data[key]; }
};

const STORAGE_KEY = 'smart_campus_leave_applications';

function getLeaveApplications() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeaveApplications(applications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch (error) {
    console.error('保存失败:', error);
  }
}

function generateId() {
  return 'leave_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function addLeaveApplication(application) {
  const applications = getLeaveApplications();
  const newApplication = {
    ...application,
    id: generateId(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  applications.unshift(newApplication);
  saveLeaveApplications(applications);
  return newApplication;
}

console.log('=== 测试开始 ===\n');

localStorage.removeItem(STORAGE_KEY);

console.log('1. 测试初始状态：');
const initialData = getLeaveApplications();
console.log('   初始数据为空:', initialData.length === 0 ? '✓ 通过' : '✗ 失败');

console.log('\n2. 测试添加请假申请：');
const newLeave = addLeaveApplication({
  type: 'sick',
  startTime: '2026-06-20 09:00:00',
  endTime: '2026-06-20 18:00:00',
  course: '高等数学',
  reason: '感冒发烧需要去医院就诊'
});
console.log('   生成ID:', newLeave.id ? '✓ 通过' : '✗ 失败');
console.log('   状态为待审批:', newLeave.status === 'pending' ? '✓ 通过' : '✗ 失败');
console.log('   包含创建时间:', newLeave.createdAt ? '✓ 通过' : '✗ 失败');

console.log('\n3. 测试添加第二条请假申请（已通过状态）：');
const approvedLeave = {
  id: generateId(),
  type: 'personal',
  startTime: '2026-06-25 09:00:00',
  endTime: '2026-06-25 12:00:00',
  course: '大学英语',
  reason: '家中有事需要处理',
  status: 'approved',
  createdAt: new Date().toISOString()
};
const allLeaves = getLeaveApplications();
allLeaves.unshift(approvedLeave);
saveLeaveApplications(allLeaves);

console.log('\n4. 测试数据持久化（模拟刷新页面）：');
const dataAfterRefresh = getLeaveApplications();
console.log('   刷新后数据条数为2:', dataAfterRefresh.length === 2 ? '✓ 通过' : '✗ 失败');
console.log('   第一条记录ID匹配:', dataAfterRefresh[0].id === approvedLeave.id ? '✓ 通过' : '✗ 失败');
console.log('   第二条记录ID匹配:', dataAfterRefresh[1].id === newLeave.id ? '✓ 通过' : '✗ 失败');

console.log('\n5. 测试状态筛选逻辑：');
const pendingOnly = dataAfterRefresh.filter(item => item.status === 'pending');
const approvedOnly = dataAfterRefresh.filter(item => item.status === 'approved');
const rejectedOnly = dataAfterRefresh.filter(item => item.status === 'rejected');
console.log('   筛选待审批: 1条', pendingOnly.length === 1 ? '✓ 通过' : '✗ 失败');
console.log('   筛选已通过: 1条', approvedOnly.length === 1 ? '✓ 通过' : '✗ 失败');
console.log('   筛选已拒绝: 0条', rejectedOnly.length === 0 ? '✓ 通过' : '✗ 失败');

console.log('\n6. 测试时间校验逻辑：');
function validateTime(start, end) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return endTime > startTime;
}
const test1 = validateTime('2026-06-20 09:00:00', '2026-06-20 08:00:00') === false;
const test2 = validateTime('2026-06-20 09:00:00', '2026-06-20 09:00:00') === false;
const test3 = validateTime('2026-06-20 09:00:00', '2026-06-20 18:00:00') === true;
console.log('   结束时间早于开始时间: 返回false', test1 ? '✓ 通过' : '✗ 失败');
console.log('   结束时间等于开始时间: 返回false', test2 ? '✓ 通过' : '✗ 失败');
console.log('   结束时间晚于开始时间: 返回true', test3 ? '✓ 通过' : '✗ 失败');

console.log('\n7. 测试原因非空校验：');
function validateReason(reason) {
  return reason.trim().length >= 5;
}
const test4 = validateReason('') === false;
const test5 = validateReason('abcd') === false;
const test6 = validateReason('感冒发烧了') === true;
console.log('   空原因: 不通过', test4 ? '✓ 通过' : '✗ 失败');
console.log('   原因少于5字符: 不通过', test5 ? '✓ 通过' : '✗ 失败');
console.log('   原因5字符以上(感冒发烧了): 通过', test6 ? '✓ 通过' : '✗ 失败');

const allPassed = initialData.length === 0 &&
  newLeave.id && newLeave.status === 'pending' && newLeave.createdAt &&
  dataAfterRefresh.length === 2 &&
  dataAfterRefresh[0].id === approvedLeave.id &&
  dataAfterRefresh[1].id === newLeave.id &&
  pendingOnly.length === 1 && approvedOnly.length === 1 && rejectedOnly.length === 0 &&
  test1 && test2 && test3 && test4 && test5 && test6;

console.log('\n=== 测试完成 ===');
console.log('\n结果:', allPassed ? '✓ 所有测试通过！' : '✗ 部分测试失败');

process.exit(allPassed ? 0 : 1);
