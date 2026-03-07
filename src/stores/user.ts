import { defineStore } from 'pinia';
import axios, { type AxiosRequestConfig } from 'axios';
import { useAuthStore } from './auth';
import type { User, UserPaginationParams } from '@/types/user';

interface UserPayload extends Partial<User> {
  password?: string;
  image_file?: File | null;
  is_admin: boolean;
  is_hr: boolean;
  is_validator: boolean;
  is_employee: boolean;
  is_simple: boolean;
  _method?: string;
}

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

    async fetchUsers(params: UserPaginationParams): Promise<void> {
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

    async saveUser(payload: UserPayload, isEdit: boolean): Promise<void> {
      this.saving = true;
      try {
        const config = this.getAuthConfig();
        const formData = new FormData();

        // Type-safe iteration over the payload
        (Object.keys(payload) as Array<keyof UserPayload>).forEach((key) => {
          const value = payload[key];

          if (value === null || value === undefined) return;

          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          } else if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        });

        if (isEdit && payload.id) {
          formData.append('_method', 'PUT');
          await axios.post(`http://localhost/api/user/${payload.id}`, formData, config);
        } else {
          await axios.post('http://localhost/api/user', formData, config);
        }
      } catch (error) {
        console.error("Store: Error saving user", error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async deleteUser(id: number): Promise<void> {
      try {
        await axios.delete(`http://localhost/api/user/${id}`, this.getAuthConfig());
      } catch (error) {
        console.error("Store: Error deleting user", error);
        throw error;
      }
    }
  }
});
