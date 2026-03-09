import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'
import { showErrorToast, showSuccessToast } from '@/plugins/toast'

interface Unit {
  id: number
  name: string
  parent: { id: number; name: string } | null
  validator: { id: number; fullname: string } | null
}

// Updated interface to include optional search string
interface UnitPaginationParams {
  page?: number
  per_page?: number
  search?: string
}

export const useUnitStore = defineStore('unit', {
  state: () => ({
    units: [] as Unit[],
    totalItems: 0,
    loading: false,
    saving: false,
  }),

  actions: {
    getAuthConfig() {
      const authStore = useAuthStore()
      return {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          Accept: 'application/json',
        },
      }
    },

    async fetchUnits(params: UnitPaginationParams): Promise<void> {
      this.loading = true
      try {
        const response = await axios.get('http://localhost/api/unit', {
          ...this.getAuthConfig(),
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            search: params.search || '',
          },
        })
        this.units = response.data.data
        this.totalItems = response.data.meta.total
      } catch (error: any) {
        // Handle 404 gracefully if no units are found matching the search
        if (error.response?.status !== 404) {
          showErrorToast(error.response?.data?.message || 'Failed to fetch units.')
        } else {
          this.units = []
          this.totalItems = 0
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveUnit(payload: any, isEdit: boolean): Promise<void> {
      this.saving = true
      try {
        const config = this.getAuthConfig()
        let response

        if (isEdit) {
          response = await axios.put(`http://localhost/api/unit/${payload.id}`, payload, config)
        } else {
          response = await axios.post('http://localhost/api/unit', payload, config)
        }

        showSuccessToast(response.data.message || 'Unit saved successfully!')
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to save unit.')
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteUnit(id: number): Promise<void> {
      try {
        const response = await axios.delete(`http://localhost/api/unit/${id}`, this.getAuthConfig())
        showSuccessToast(response.data.message || 'Unit deleted successfully!')
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to delete unit.')
        throw error
      }
    },
  },
})
