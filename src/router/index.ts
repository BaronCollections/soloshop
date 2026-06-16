import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { currentUser } from '../stores/userStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'class-management',
        name: 'ClassManagement',
        component: () => import('../views/ClassManagement.vue')
      },
      {
        path: 'teacher/attendance',
        name: 'TeacherAttendance',
        component: () => import('../views/TeacherAttendance.vue')
      },
      {
        path: 'student/attendance',
        name: 'StudentAttendance',
        component: () => import('../views/StudentAttendance.vue')
      },
      {
        path: 'student/leave',
        name: 'StudentLeave',
        component: () => import('../views/LeaveApplication.vue')
      },
      {
        path: 'admin/attendance',
        name: 'AdminAttendance',
        component: () => import('../views/AdminAttendance.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.path === '/login') {
    next()
    return
  }

  if (!currentUser.value) {
    next('/login')
    return
  }

  next()
})

export default router
