<script setup lang="ts">
import { ref, computed } from 'vue'
import Login from './views/Login.vue'
import LeaveApplication from './views/LeaveApplication.vue'
import type { MockUser } from './mock/accounts'

const loggedInUser = ref<MockUser | null>(null)

const showLeavePage = computed(() => {
  return loggedInUser.value?.role === 'student'
})

const handleLoginSuccess = (user: MockUser) => {
  loggedInUser.value = user
}

const handleLogout = () => {
  loggedInUser.value = null
}
</script>

<template>
  <LeaveApplication v-if="showLeavePage" />
  <Login
    v-else
    @login-success="handleLoginSuccess"
    @logout="handleLogout"
  />
</template>
