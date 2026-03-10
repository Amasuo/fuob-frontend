<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      color="grey-lighten-4"
      elevation="0"
      border="0"
      style="overflow: hidden !important"
    >
      <div class="d-flex flex-column" style="height: 100vh">
        <div class="pa-6 pb-0 flex-shrink-0">
          <div class="d-flex align-center mb-10">
            <v-avatar color="#f57c00" size="40" class="mr-3">
              <v-icon color="white">mdi-calendar-check</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-bold text-grey-darken-4">
              {{ $t('app.title_sidebar') }}
            </span>
          </div>
        </div>

        <div class="flex-grow-1 overflow-y-auto px-6 custom-scrollbar">
          <v-list density="comfortable" nav class="bg-transparent px-0">
            <v-list-item
              v-for="route in menuItems"
              :key="route.path"
              :to="route.path"
              :prepend-icon="getIcon(route.name?.toString() || '')"
              :title="formatTitle(route.name?.toString() || '')"
              active-class="active-nav-item"
              class="mb-1 nav-item"
            ></v-list-item>
          </v-list>
        </div>

        <div class="pa-6 pt-4 flex-shrink-0 border-t bg-grey-lighten-4">
          <v-list density="compact" nav class="bg-transparent px-0">
            <v-list-item
              prepend-icon="mdi-logout"
              :title="$t('app.logout')"
              class="rounded-lg logout-item"
              @click="handleLogout"
            ></v-list-item>
          </v-list>
        </div>
      </div>
    </v-navigation-drawer>

    <v-app-bar flat border-b color="white">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-subtitle-1 font-weight-bold text-grey-darken-2">
        {{ $t('app.title') }}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-menu location="bottom end" transition="slide-y-transition">
        <template #activator="{ props }">
          <v-avatar
            size="45"
            v-bind="props"
            class="mr-4 border cursor-pointer shadow-sm"
            :color="safeUser.profile_image ? 'transparent' : '#fff3e0'"
          >
            <v-img v-if="safeUser.profile_image" :src="safeUser.profile_image" cover></v-img>
            <span v-else class="text-subtitle-1 font-weight-bold" style="color: #e65100">
              {{ safeUser.firstname?.[0] || 'U' }}{{ safeUser.lastname?.[0] || 'N' }}
            </span>
          </v-avatar>
        </template>

        <v-list class="py-2" min-width="180">
          <v-list-item
            prepend-icon="mdi-cog-outline"
            :title="$t('app.settings')"
            @click="goToSettings"
          ></v-list-item>
          <v-divider class="my-1"></v-divider>
          <v-list-item
            prepend-icon="mdi-logout"
            :title="$t('app.logout')"
            class="logout-item"
            @click="handleLogout"
          ></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5" style="height: 100vh; overflow-y: auto">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import routes from '~pages'
import { adminPages, hrPages, validatorPages } from '@/router'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const { user, isAdmin, isHr, isValidator, isSimple } = storeToRefs(authStore)
const drawer = ref(true)

const safeUser = computed(
  () => user.value || { firstname: 'U', lastname: 'N', profile_image: null },
)

const menuItems = computed(() => {
  let filtered = []
  if (isSimple.value) {
    filtered = routes.filter((r) => r.name?.toString().toLowerCase().includes('welcome'))
  } else {
    let excluded = ['login', 'forbidden', 'settings', 'resetpassword']
    if (!isAdmin.value) excluded = excluded.concat(adminPages)
    if (!isHr.value) excluded = excluded.concat(hrPages)
    if (!isValidator.value) excluded = excluded.concat(validatorPages)
    filtered = routes.filter((r) => {
      const name = r.name?.toString().toLowerCase() || ''
      return !excluded.includes(name) && !name.includes('notfound')
    })
  }
  return filtered.sort((a, b) => {
    const nameA = a.name?.toString().toLowerCase() || ''
    const nameB = b.name?.toString().toLowerCase() || ''
    if (nameA === 'welcome') return -1
    if (nameB === 'welcome') return 1
    return nameA.localeCompare(nameB)
  })
})

const formatTitle = (name: string) => {
  const key = `app.sidebar.${name.toLowerCase()}`
  const translated = t(key)
  return translated !== key
    ? translated
    : name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
}

const getIcon = (name: string) => {
  const icons: Record<string, string> = {
    welcome: 'mdi-view-dashboard-outline',
    users: 'mdi-account-group-outline',
    roles: 'mdi-shield-key-outline',
    languages: 'mdi-translate',
    units: 'mdi-domain',
    calendars: 'mdi-calendar-clock-outline',
  }
  return icons[name.toLowerCase()] || 'mdi-file-outline'
}

const goToSettings = () => router.push({ name: 'Settings' })
const handleLogout = async () => await authStore.logout()
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

/* Scrollbar Sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}

:global(html) {
  overflow: hidden !important;
}

/* Standard Nav Item Style */
.nav-item {
  color: #616161 !important;
  transition: all 0.2s ease;
}

/* Match the exact orange of 'Welcome' */
.active-nav-item {
  background-color: #fff3e0 !important;
  color: #e65100 !important;
}

.nav-item:hover:not(.active-nav-item) {
  background-color: #f5f5f5 !important;
}

/* Logout Item - Styled to perfectly match 'Welcome' structure but in Red */
.logout-item {
  color: #616161 !important;
  transition: all 0.2s ease;
}

.logout-item:hover {
  background-color: #fff3e0 !important; /* Soft Red background */
  color: #e65100 !important; /* Red text */
}

/* Ensure Icons also change color */
.logout-item:hover :deep(.v-icon) {
  color: #e65100 !important;
}
</style>
