import { defineStore } from 'pinia'
import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from './auth'
import { showErrorToast, showSuccessToast } from '@/plugins/toast'

export interface Holiday {
  id: number
  name: string
  date: string
}

export interface HolidayPayload {
  id?: number
  name: string
  date: string
}

interface HolidayPaginationParams {
  page?: number
  per_page?: number
  search?: string
}

export const useHolidayStore = defineStore('holiday', {
  state: () => ({
    holidays: [] as Holiday[],
    totalItems: 0,
    loading: false,
    saving: false,
  }),

  actions: {
    getAuthConfig(): AxiosRequestConfig {
      const authStore = useAuthStore()
      return {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          Accept: 'application/json',
        },
      }
    },

    async fetchHolidays(params: HolidayPaginationParams): Promise<void> {
      this.loading = true
      try {
        const response = await axios.get('http://localhost/api/holidays', {
          ...this.getAuthConfig(),
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            search: params.search || '',
          },
        })
        this.holidays = response.data.data
        this.totalItems = response.data.meta.total
      } catch (error: any) {
        // Handle 404 gracefully if no units are found matching the search
        if (error.response?.status !== 404) {
          showErrorToast(error.response?.data?.message || 'Failed to fetch holidays.')
        } else {
          this.holidays = []
          this.totalItems = 0
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveHoliday(payload: any, isEdit: boolean): Promise<boolean> {
      this.saving = true
      try {
        let response
        if (isEdit && payload.id) {
          response = await axios.put(
            `http://localhost/api/holidays/${payload.id}`,
            payload,
            this.getAuthConfig()
          )
        } else {
          response = await axios.post(
            'http://localhost/api/holidays',
            payload,
            this.getAuthConfig()
          )
        }
        showSuccessToast(response.data.message || 'Jour férié sauvegardé !')
        return true
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Erreur de sauvegarde.')
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteHoliday(id: number): Promise<boolean> {
      try {
        const response = await axios.delete(
          `http://localhost/api/holidays/${id}`,
          this.getAuthConfig()
        )
        showSuccessToast(response.data.message || 'Jour férié supprimé !')
        return true
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Erreur de suppression.')
        return false
      }
    },
  },
})
