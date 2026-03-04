import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export interface Role {
  id: number | null
  name: string
  icon?: string
  description?: string
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
          // Note: If your roles list is small, you might not need pagination params here
          params: { page: 1, search: '' },
        })

        // Handling both paginated (data.data) and simple array responses
        this.roles = response.data.data || response.data
      } catch (error) {
        console.error('RoleStore: Error fetching roles', error)
      } finally {
        this.loading = false
      }
    },

    async updateRole(id: number, payload: { icon?: string; description?: string }) {
      const authStore = useAuthStore()
      try {
        const response = await axios.patch(`http://localhost/api/role/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        })

        // Update the local state so the UI reflects changes immediately without a full reload
        const index = this.roles.findIndex((r) => r.id === id)
        if (index !== -1) {
          this.roles[index] = { ...this.roles[index], ...response.data.role }
        }

        return response.data
      } catch (error) {
        console.error('RoleStore: Error updating role', error)
        throw error // Throw so the component can handle the error (e.g., stop loading state)
      }
    },
  },
})
