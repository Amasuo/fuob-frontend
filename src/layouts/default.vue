<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" color="grey-lighten-4" elevation="0">
      <div class="pa-6 d-flex flex-column fill-height">
        <div class="d-flex align-center mb-10">
          <v-avatar color="orange-darken-2" size="40" class="mr-3">
            <v-icon color="white">mdi-calendar-check</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-bold text-grey-darken-4">Manage Leaves</span>
        </div>

        <v-list density="comfortable" nav class="bg-transparent">
          <v-list-item
            v-for="route in menuItems"
            :key="route.path"
            :to="route.path"
            :prepend-icon="getIcon(route.name?.toString() || '')"
            :title="formatTitle(route.name?.toString() || '')"
            color="orange-darken-2"
          ></v-list-item>
        </v-list>

        <v-spacer></v-spacer>

        <v-list density="compact" nav class="bg-transparent">
          <v-list-item
            prepend-icon="mdi-cog-outline"
            title="Settings"
            value="settings"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            color="red-darken-2"
            @click="handleLogout"
          ></v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-app-bar flat border-b color="white">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-subtitle-1 font-weight-bold text-grey-darken-2">
        Leave Management System
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-avatar size="35" class="mr-4 border">
        <v-img :src="user.image || 'https://cdn.vuetifyjs.com/images/john.jpg'"></v-img>
      </v-avatar>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import routes from '~pages'
import { adminPages, hrPages, validatorPages } from '@/router'

const authStore = useAuthStore()
const { user, isAdmin, isHr, isValidator, isSimple } = storeToRefs(authStore)
const drawer = ref(true)

const menuItems = computed(() => {
  let filtered = []

  if (isSimple.value) {
    filtered = routes.filter((route) => {
      const name = route.name?.toString().toLowerCase() || ''
      return name.includes('welcome')
    })
  } else {
    // Explicitly exclude pages that should NOT have a sidebar
    let excluded = ['login', 'forbidden']
    if (!isAdmin.value) excluded = excluded.concat(adminPages)
    if (!isHr.value) excluded = excluded.concat(hrPages)
    if (!isValidator.value) excluded = excluded.concat(validatorPages)

    filtered = routes.filter((route) => {
      const name = route.name?.toString().toLowerCase() || ''
      return !excluded.includes(name) && !name.includes('notfound')
    })
  }

  // SORTING LOGIC: Move 'welcome' to the top
  return filtered.sort((a, b) => {
    const nameA = a.name?.toString().toLowerCase() || ''
    const nameB = b.name?.toString().toLowerCase() || ''

    if (nameA === 'welcome') return -1
    if (nameB === 'welcome') return 1
    return nameA.localeCompare(nameB)
  })
})

const formatTitle = (name: string) => {
  if (!name) return ''
  // Special case for HR
  if (name.toLowerCase() === 'hr') return 'HR'
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
}

const getIcon = (name: string) => {
  const icons: Record<string, string> = {
    welcome: 'mdi-view-dashboard-outline',
    users: 'mdi-account-group-outline',
    roles: 'mdi-file-document-outline', // Added icon for Roles
  }
  return icons[name.toLowerCase()] || 'mdi-file-outline'
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>
