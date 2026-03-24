import { defineStore } from 'pinia'
import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from './auth'
import { showErrorToast, showSuccessToast } from '@/plugins/toast'

export interface LeaveType {
  id: number | null
  code: string
  name: string
  color: string
  is_paid: boolean
  has_balance: boolean
  requires_doc: boolean
  validation_rh_only: boolean
  is_active: boolean
}

interface LeaveTypePaginationParams {
  page?: number
  per_page?: number
  search?: string
}

export const useLeaveTypeStore = defineStore('leave-type', {
  state: () => ({
    leaveTypes: [] as LeaveType[],
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

    async fetchLeaveTypes(params: LeaveTypePaginationParams): Promise<void> {
      this.loading = true
      try {
        const response = await axios.get('http://localhost/api/leave-type', {
          ...this.getAuthConfig(),
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            search: params.search || '',
          },
        })
        this.leaveTypes = response.data.data
        this.totalItems = response.data.meta.total
      } catch (error: any) {
        if (error.response?.status !== 404) {
          showErrorToast(error.response?.data?.message || 'Failed to fetch leave types.')
        } else {
          this.leaveTypes = []
          this.totalItems = 0
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveLeaveType(payload: LeaveType, isEdit: boolean): Promise<void> {
      this.saving = true
      try {
        const config = this.getAuthConfig()
        let response

        if (isEdit && payload.id) {
          response = await axios.put(`http://localhost/api/leave-type/${payload.id}`, payload, config)
        } else {
          response = await axios.post('http://localhost/api/leave-type', payload, config)
        }

        showSuccessToast(response.data.message || 'Leave type saved successfully!')
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to save leave type.')
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteLeaveType(id: number): Promise<void> {
      try {
        const response = await axios.delete(`http://localhost/api/leave-type/${id}`, this.getAuthConfig())
        showSuccessToast(response.data.message || 'Leave type deleted successfully!')
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to delete leave type.')
        throw error
      }
    },
  },
})