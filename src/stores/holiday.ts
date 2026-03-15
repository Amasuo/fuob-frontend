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

export const useHolidayStore = defineStore('holiday', {
  state: () => ({
    holidays: [] as Holiday[],
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

    async fetchHolidays(): Promise<void> {
      this.loading = true
      try {
        const response = await axios.get('http://localhost/api/holidays',
          this.getAuthConfig()
        )
        this.holidays = response.data.data
      } catch (error: any) {
        if (error.response?.status === 404) {
          this.holidays = []
        } else {
          showErrorToast(error.response?.data?.message || 'Failed to fetch holidays.')
        }
      } finally {
        this.loading = false
      }
    },

    async saveHoliday(payload: HolidayPayload, isEdit: boolean): Promise<boolean> {
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