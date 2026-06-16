<script setup lang="ts">
import { computed } from 'vue'
import { currentUser } from './stores/userStore'

const isLoggedIn = computed(() => !!currentUser.value)
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
