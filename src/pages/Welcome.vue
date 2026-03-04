<template>
  <AdminDashboard v-if="isAdmin" />
  <HrDashboard v-else-if="isHr" />
  <ValidatorDashboard v-else-if="isValidator" />
  <EmployeeDashboard v-else-if="isEmployee" />
  <ForbiddenPage v-else/>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const { isAdmin, isHr, isValidator, isEmployee } = storeToRefs(authStore)
import AdminDashboard from '@/components/admin/Dashboard.vue'
import EmployeeDashboard from '@/components/employee/Dashboard.vue'
import HrDashboard from '@/components/hr/Dashboard.vue'
import ValidatorDashboard from '@/components/validator/Dashboard.vue'
import ForbiddenPage from '@/pages/Forbidden.vue'
</script>

<style scoped>
/* Scoped styles for the welcome container if needed */
</style>

<route lang="yaml">
meta:
  layout: default
</route>
