type ClassInfo = {
  id: string
  name: string
  grade: string
  headTeacher: string
  studentCount: number
  classroom: string
  createdAt: string
}

const mockClasses: ClassInfo[] = [
  { id: '1', name: '一年级(1)班', grade: '一年级', headTeacher: '张老师', studentCount: 45, classroom: 'A101', createdAt: '' },
  { id: '2', name: '一年级(2)班', grade: '一年级', headTeacher: '李老师', studentCount: 42, classroom: 'A102', createdAt: '' },
  { id: '3', name: '二年级(1)班', grade: '二年级', headTeacher: '王老师', studentCount: 48, classroom: 'A201', createdAt: '' },
]

function isClassNameDuplicate(name: string, excludeId?: string, classes: ClassInfo[] = mockClasses): boolean {
  const trimmedName = name.trim()
  return classes.some(c => c.name.trim() === trimmedName && c.id !== excludeId)
}

console.log('=== 班级名称重复校验测试 ===\n')

let passed = 0
let failed = 0

function test(name: string, fn: () => boolean) {
  try {
    const result = fn()
    if (result) {
      console.log(`✅ ${name}`)
      passed++
    } else {
      console.log(`❌ ${name}`)
      failed++
    }
  } catch (e) {
    console.log(`❌ ${name} - 异常: ${e}`)
    failed++
  }
}

test('新增重复名称应被拦截', () => {
  return isClassNameDuplicate('一年级(1)班') === true
})

test('新增不重复名称应通过', () => {
  return isClassNameDuplicate('一年级(3)班') === false
})

test('新增带前后空格的重复名称应被拦截', () => {
  return isClassNameDuplicate(' 一年级(1)班 ') === true
})

test('新增带前空格的重复名称应被拦截', () => {
  return isClassNameDuplicate(' 一年级(1)班') === true
})

test('新增带后空格的重复名称应被拦截', () => {
  return isClassNameDuplicate('一年级(1)班 ') === true
})

test('编辑自身名称（无变化）应通过', () => {
  return isClassNameDuplicate('一年级(1)班', '1') === false
})

test('编辑时改为其他班名称应被拦截', () => {
  return isClassNameDuplicate('一年级(2)班', '1') === true
})

test('编辑时改为带空格的其他班名称应被拦截', () => {
  return isClassNameDuplicate(' 一年级(2)班 ', '1') === true
})

test('编辑时改为新名称应通过', () => {
  return isClassNameDuplicate('一年级(3)班', '1') === false
})

test('存储中带空格的名称也能正确匹配', () => {
  const testClasses = [...mockClasses, { id: '4', name: ' 三年级(1)班 ', grade: '三年级', headTeacher: '刘老师', studentCount: 46, classroom: 'A301', createdAt: '' }]
  return isClassNameDuplicate('三年级(1)班', undefined, testClasses) === true
})

test('编辑自身带空格的名称应通过', () => {
  const testClasses = [
    { id: '1', name: ' 一年级(1)班 ', grade: '一年级', headTeacher: '张老师', studentCount: 45, classroom: 'A101', createdAt: '' },
    { id: '2', name: '一年级(2)班', grade: '一年级', headTeacher: '李老师', studentCount: 42, classroom: 'A102', createdAt: '' },
  ]
  return isClassNameDuplicate('一年级(1)班', '1', testClasses) === false
})

console.log(`\n=== 测试结果: ${passed} 通过, ${failed} 失败 ===`)

process.exit(failed > 0 ? 1 : 0)
