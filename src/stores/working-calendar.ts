import { defineStore } from 'pinia'
import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from './auth'
import { showErrorToast, showSuccessToast } from '@/plugins/toast'

export interface WorkingCalendarDay {
  id?: number
  day_number: number
  is_working: boolean
  day_label: string | null
  start_time: string | null
  end_time: string | null
}

export interface WorkingCalendar {
  id: number | null
  name: string
  cycle_duration: number
  description: string | null
  is_active: boolean
  cycle_start_date: string
  days: WorkingCalendarDay[]
}

export const useWorkingCalendarStore = defineStore('workingCalendar', {
  state: () => ({
    calendars: [] as WorkingCalendar[],
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

    async fetchCalendars(params: {
      page?: number
      per_page?: number
      search?: string
    }): Promise<void> {
      this.loading = true
      try {
        const response = await axios.get('http://localhost/api/working-calendar', {
          ...this.getAuthConfig(),
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            search: params.search || '',
          },
        })
        this.calendars = response.data.data
        this.totalItems = response.data.meta?.total || response.data.data.length
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to fetch calendars.')
      } finally {
        this.loading = false
      }
    },

    async saveCalendar(payload: any, isEdit: boolean): Promise<void> {
      this.saving = true
      try {
        const config = this.getAuthConfig()
        let response

        if (isEdit && payload.id) {
          response = await axios.put(
            `http://localhost/api/working-calendar/${payload.id}`,
            payload,
            config,
          )
        } else {
          response = await axios.post('http://localhost/api/working-calendar', payload, config)
        }
        showSuccessToast(response.data.message || 'Calendar saved successfully!')
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to save calendar.')
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteCalendar(id: number): Promise<void> {
      try {
        const response = await axios.delete(
          `http://localhost/api/working-calendar/${id}`,
          this.getAuthConfig(),
        )
        showSuccessToast(response.data.message || 'Calendar deleted successfully!')
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to delete calendar.')
      }
    },
  },
})
