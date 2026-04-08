import { defineStore } from 'pinia'
import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from './auth'
import type { Workflow } from '@/types/workflow'
import { showErrorToast, showSuccessToast } from '@/plugins/toast'

interface WorkflowPayload {
  name: string
  steps: {
    user_id: number
    secondary_user_id?: number | null
    start_date?: string | null
    end_date?: string | null
  }[]
}

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    workflows: [] as Workflow[],
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

    async fetchWorkflows(params: { page?: number; per_page?: number; search?: string }) {
      this.loading = true
      try {
        const response = await axios.get('http://localhost/api/workflow', {
          ...this.getAuthConfig(),
          params: {
            page: params.page || 1,
            per_page: params.per_page || 10,
            search: params.search || '',
          },
        })
        this.workflows = response.data.data
        this.totalItems = response.data.meta?.total || response.data.data.length
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to fetch workflows.')
      } finally {
        this.loading = false
      }
    },

    async saveWorkflow(payload: WorkflowPayload, id: number | null = null) {
      this.saving = true
      try {
        const config = this.getAuthConfig()
        let response
        if (id) {
          response = await axios.put(`http://localhost/api/workflow/${id}`, payload, config)
        } else {
          response = await axios.post('http://localhost/api/workflow', payload, config)
        }
        showSuccessToast(response.data.message || 'Workflow saved successfully!')
        return response.data.data
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to save workflow.')
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteWorkflow(id: number) {
      try {
        await axios.delete(`http://localhost/api/workflow/${id}`, this.getAuthConfig())
        showSuccessToast('Workflow deleted successfully!')
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to delete workflow.')
        throw error
      }
    },
  },
})