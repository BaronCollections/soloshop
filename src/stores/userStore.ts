import { ref, watch } from 'vue'
import type { MockUser } from '../mock/accounts'

const USER_STORAGE_KEY = 'smart_campus_current_user'

const savedUser = (() => {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
})()

export const currentUser = ref<MockUser | null>(savedUser)

watch(currentUser, (user) => {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
})

export const setCurrentUser = (user: MockUser | null) => {
  currentUser.value = user
}

export const getCurrentUser = () => {
  return currentUser.value
}
