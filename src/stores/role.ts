import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export interface Role {
  id: number | null
  name: string
  display_name: string
  icon?: string
  description?: string
  permissions?: any[]
}

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [] as Role[],
    loading: false,
  }),

  actions: {
    async fetchRoles() {
      const authStore = useAuthStore()
      this.loading = true
      try {
        const response = await axios.get('http://localhost/api/role', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        })

        // Handles standard Laravel Resource collection responses
        this.roles = response.data.data || response.data
      } catch (error) {
        console.error('RoleStore: Error fetching roles', error)
      } finally {
        this.loading = false
      }
    },

    async updateRole(id: number, payload: { icon?: string }) {
      const authStore = useAuthStore()
      try {
        const response = await axios.patch(`http://localhost/api/role/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        })

        const index = this.roles.findIndex((r) => r.id === id)
        if (index !== -1) {
          this.roles[index] = { ...this.roles[index], ...response.data }
        }

        return response.data
      } catch (error) {
        console.error('RoleStore: Error updating role', error)
        throw error
      }
    },
  },
})
