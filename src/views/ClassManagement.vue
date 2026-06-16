<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import type { ClassInfo } from '../types/class'
import { GRADE_OPTIONS, HEAD_TEACHER_OPTIONS } from '../types/class'
import { getClasses, saveClasses, generateClassId, isClassNameDuplicate } from '../utils/classStorage'

const listLoading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)

const classList = ref<ClassInfo[]>([])

const searchForm = reactive({
  grade: 'all',
  headTeacher: '',
  keyword: ''
})

const dialogFormRef = ref<FormInstance>()

const classForm = reactive({
  id: '',
  name: '',
  grade: '',
  headTeacher: '',
  studentCount: undefined as number | undefined,
  classroom: ''
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (!value || !value.trim()) {
          callback()
          return
        }
        const trimmedValue = value.trim()
        const excludeId = dialogType.value === 'edit' ? classForm.id : undefined
        if (isClassNameDuplicate(trimmedValue, excludeId)) {
          callback(new Error('班级名称已存在，请重新输入'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  headTeacher: [{ required: true, message: '请选择班主任', trigger: 'change' }],
  studentCount: [
    { required: true, message: '请输入学生人数', trigger: 'blur' },
    { type: 'number', min: 1, max: 200, message: '学生人数需在1-200之间', trigger: 'blur' }
  ],
  classroom: [{ required: true, message: '请输入教室', trigger: 'blur' }]
}

const gradeFilterOptions = computed(() => GRADE_OPTIONS)

const headTeacherFilterOptions = computed(() => {
  const uniqueTeachers = new Set<string>()
  classList.value.forEach(c => uniqueTeachers.add(c.headTeacher))
  return [
    { value: '', label: '全部班主任' },
    ...Array.from(uniqueTeachers).map(t => ({ value: t, label: t }))
  ]
})

const filteredList = computed(() => {
  let result = classList.value

  if (searchForm.grade && searchForm.grade !== 'all') {
    result = result.filter(item => item.grade === searchForm.grade)
  }

  if (searchForm.headTeacher) {
    result = result.filter(item => item.headTeacher === searchForm.headTeacher)
  }

  if (searchForm.keyword) {
    const kw = searchForm.keyword.toLowerCase()
    result = result.filter(
      item =>
        item.name.toLowerCase().includes(kw) ||
        item.classroom.toLowerCase().includes(kw) ||
        item.headTeacher.toLowerCase().includes(kw)
    )
  }

  return result
})

const loadData = () => {
  listLoading.value = true
  setTimeout(() => {
    classList.value = getClasses()
    listLoading.value = false
  }, 300)
}

const resetForm = () => {
  classForm.id = ''
  classForm.name = ''
  classForm.grade = ''
  classForm.headTeacher = ''
  classForm.studentCount = undefined
  classForm.classroom = ''
  dialogFormRef.value?.clearValidate()
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: ClassInfo) => {
  dialogType.value = 'edit'
  resetForm()
  classForm.id = row.id
  classForm.name = row.name
  classForm.grade = row.grade
  classForm.headTeacher = row.headTeacher
  classForm.studentCount = row.studentCount
  classForm.classroom = row.classroom
  dialogVisible.value = true
}

const handleDelete = (row: ClassInfo) => {
  ElMessageBox.confirm(`确定要删除班级「${row.name}」吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = classList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        classList.value.splice(index, 1)
        saveClasses(classList.value)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

const handleSubmit = async () => {
  if (!dialogFormRef.value) return

  await dialogFormRef.value.validate((valid) => {
    if (!valid) return

    submitLoading.value = true
    setTimeout(() => {
      const trimmedName = classForm.name.trim()
      if (dialogType.value === 'add') {
        const newClass: ClassInfo = {
          id: generateClassId(),
          name: trimmedName,
          grade: classForm.grade,
          headTeacher: classForm.headTeacher,
          studentCount: classForm.studentCount!,
          classroom: classForm.classroom,
          createdAt: new Date().toISOString()
        }
        classList.value.unshift(newClass)
        saveClasses(classList.value)
        ElMessage.success('新增班级成功')
      } else {
        const index = classList.value.findIndex(item => item.id === classForm.id)
        if (index > -1) {
          classList.value[index] = {
            ...classList.value[index],
            name: trimmedName,
            grade: classForm.grade,
            headTeacher: classForm.headTeacher,
            studentCount: classForm.studentCount!,
            classroom: classForm.classroom
          }
          saveClasses(classList.value)
          ElMessage.success('编辑班级成功')
        }
      }

      dialogVisible.value = false
      submitLoading.value = false
      resetForm()
    }, 500)
  })
}

const handleResetSearch = () => {
  searchForm.grade = 'all'
  searchForm.headTeacher = ''
  searchForm.keyword = ''
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

const dialogTitle = computed(() => (dialogType.value === 'add' ? '新增班级' : '编辑班级'))

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="class-container">
    <div class="page-header">
      <h2 class="page-title">班级管理</h2>
      <p class="page-subtitle">智慧校园班级信息管理，支持增删改查与筛选搜索</p>
    </div>

    <div class="content-card">
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="年级">
            <el-select
              v-model="searchForm.grade"
              placeholder="请选择年级"
              style="width: 160px"
              clearable
            >
              <el-option
                v-for="item in gradeFilterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="班主任">
            <el-select
              v-model="searchForm.headTeacher"
              placeholder="请选择班主任"
              style="width: 160px"
              clearable
              filterable
            >
              <el-option
                v-for="item in headTeacherFilterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="班级名称/教室/班主任"
              style="width: 240px"
              clearable
              :prefix-icon="Search"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search">搜索</el-button>
            <el-button :icon="Refresh" @click="handleResetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <span class="total-count">共 {{ filteredList.length }} 个班级</span>
        </div>
        <div class="toolbar-right">
          <el-button :icon="Refresh" @click="loadData">
            刷新
          </el-button>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增班级
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="listLoading"
        :data="filteredList"
        style="width: 100%"
        stripe
        empty-text="暂无班级数据"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="name" label="班级名称" min-width="140" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="headTeacher" label="班主任" width="120" />
        <el-table-column prop="studentCount" label="学生人数" width="100" align="center" />
        <el-table-column prop="classroom" label="教室" min-width="140" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="dialogFormRef"
        :model="classForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="班级名称" prop="name">
          <el-input
            v-model="classForm.name"
            placeholder="请输入班级名称，如：一年级(1)班"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="年级" prop="grade">
          <el-select
            v-model="classForm.grade"
            placeholder="请选择年级"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in GRADE_OPTIONS.filter(g => g.value !== 'all')"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="班主任" prop="headTeacher">
          <el-select
            v-model="classForm.headTeacher"
            placeholder="请选择班主任"
            style="width: 100%"
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="teacher in HEAD_TEACHER_OPTIONS"
              :key="teacher"
              :label="teacher"
              :value="teacher"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="学生人数" prop="studentCount">
          <el-input-number
            v-model="classForm.studentCount"
            :min="1"
            :max="200"
            placeholder="请输入学生人数"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="教室" prop="classroom">
          <el-input
            v-model="classForm.classroom"
            placeholder="请输入教室，如：教学楼A101"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.class-container {
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

.search-bar {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.search-bar :deep(.el-form-item) {
  margin-bottom: 0;
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
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.total-count {
  font-size: 14px;
  color: #606266;
}
</style>
