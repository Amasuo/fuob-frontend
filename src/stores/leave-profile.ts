import { defineStore } from 'pinia'
import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from './auth'
import { showErrorToast, showSuccessToast } from '@/plugins/toast'

export interface LeaveProfileRule {
  id?: number
  leave_profile_id?: number
  leave_type_id: number
  day_count_method: 'working' | 'business' | 'calendar' | null
  base_quota: number | null
  carryover_limit: number | null
  seniority_cycle: number | null
  seniority_gain: number | null
  seniority_max: number | null
  leave_type?: {
    id: number
    code: string
    name: string
    color: string
    is_annual: boolean
    has_balance: boolean
    lock_day_count_method: boolean
    day_count_method: string
  }
}

export interface LeaveProfile {
  id: number | null
  code: string
  name: string
  description: string | null
  is_active: boolean
  is_default: boolean
  rules: LeaveProfileRule[]
}

interface LeaveProfilePaginationParams {
  page?: number
  per_page?: number
  search?: string
}

export const useLeaveProfileStore = defineStore('leave-profile', {
  state: () => ({
    leaveProfiles: [] as LeaveProfile[],
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    searchQuery: '',
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

    async fetchLeaveProfiles(params: LeaveProfilePaginationParams): Promise<void> {
      this.loading = true
      try {
        const response = await axios.get('http://localhost/api/leave-profile', {
          ...this.getAuthConfig(),
          params: {
            page: params.page || this.currentPage,
            per_page: params.per_page || this.itemsPerPage,
            search: params.search || this.searchQuery,
          },
        })
        this.leaveProfiles = response.data.data
        this.totalItems = response.data.meta.total
        
        if (params.page) this.currentPage = params.page
        if (params.per_page) this.itemsPerPage = params.per_page
        if (params.search !== undefined) this.searchQuery = params.search
      } catch (error: any) {
        if (error.response?.status !== 404) {
          showErrorToast(error.response?.data?.message || 'Failed to fetch leave profiles.')
        } else {
          this.leaveProfiles = []
          this.totalItems = 0
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveLeaveProfile(payload: LeaveProfile, isEdit: boolean): Promise<void> {
      this.saving = true
      try {
        const config = this.getAuthConfig()
        let response

        if (isEdit && payload.id) {
          response = await axios.put(`http://localhost/api/leave-profile/${payload.id}`, payload, config)
        } else {
          response = await axios.post('http://localhost/api/leave-profile', payload, config)
        }

        showSuccessToast(response.data.message || 'Leave profile saved successfully!')
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to save leave profile.')
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteLeaveProfile(id: number): Promise<void> {
      try {
        const response = await axios.delete(`http://localhost/api/leave-profile/${id}`, this.getAuthConfig())
        showSuccessToast(response.data.message || 'Leave profile deleted successfully!')
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to delete leave profile.')
        throw error
      }
    },
  },
})