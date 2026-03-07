<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { locale } = useI18n()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

onMounted(async () => {
  // 1. Attempt to get the current user session
  const isLoggedIn = await authStore.getCurrentUser()

  // 2. If logged in and user has a language, set it
  if (isLoggedIn && user.value?.language_code) {
    locale.value = user.value.language_code
    localStorage.setItem('user-locale', user.value.language_code)
  } else {
    // 3. Fallback to localStorage for guests or if user setting is missing
    const savedLocale = localStorage.getItem('user-locale')
    if (savedLocale) {
      locale.value = savedLocale
    }
  }
})

// 4. Optional: Watch for user changes (e.g., login/logout)
watch(user, (newUser) => {
  if (newUser?.language_code) {
    locale.value = newUser.language_code
    localStorage.setItem('user-locale', newUser.language_code)
  }
})
</script>
