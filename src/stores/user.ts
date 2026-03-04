import { defineStore } from 'pinia';
import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from './auth';
import type { User, UserPaginationParams } from '@/types/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    totalItems: 0,
    loading: false,
    saving: false,
  }),

  actions: {
    getAuthConfig(): AxiosRequestConfig {
      const authStore = useAuthStore();
      return {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json',
        }
      };
    },

    async fetchUsers(params: UserPaginationParams) {
      this.loading = true;
      try {
        const response = await axios.get('http://localhost/api/user', {
          ...this.getAuthConfig(),
          params: {
            page: params.page || 1,
            search: params.search || '',
            per_page: params.per_page || 10
          }
        });
        this.users = response.data.data;
        this.totalItems = response.data.meta.total;
      } catch (error) {
        console.error("Store: Error fetching users", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async saveUser(payload: User, isEdit: boolean) {
      this.saving = true;
      try {
        const config = this.getAuthConfig();
        if (isEdit && payload.id) {
          await axios.put(`http://localhost/api/user/${payload.id}`, payload, config);
        } else {
          await axios.post('http://localhost/api/user', payload, config);
        }
      } finally {
        this.saving = false;
      }
    },

    async deleteUser(id: number) {
      try {
        await axios.delete(`http://localhost/api/user/${id}`, this.getAuthConfig());
      } catch (error) {
        console.error("Store: Error deleting user", error);
        throw error;
      }
    }
  }
});
