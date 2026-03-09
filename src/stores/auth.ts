import { defineStore } from 'pinia'
import router from '@/router'
import axios, { AxiosError } from 'axios'
import { showErrorToast, showSuccessToast } from '@/plugins/toast'
import type { User } from '@/types/user' // Importing the central interface

interface AuthState {
  user: User | null
  loginFailed: boolean
  bearerToken: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loginFailed: false,
    bearerToken: localStorage.getItem('bearer-token'),
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.user && !!state.bearerToken,
    isAdmin: (state): boolean => state.user?.is_admin ?? false,
    isHr: (state): boolean => state.user?.is_hr ?? false,
    isValidator: (state): boolean => state.user?.is_validator ?? false,
    isEmployee: (state): boolean => state.user?.is_employee ?? false,
    isSimple: (state): boolean => state.user?.is_simple ?? true,

    // Helper to get the token for axios headers
    token: (state): string | null => state.bearerToken,
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
    },

    setBearerToken(token: string | null) {
      this.bearerToken = token
      if (token) {
        localStorage.setItem('bearer-token', token)
      } else {
        localStorage.removeItem('bearer-token')
      }
    },

    // Centralized Header Helper
    getAuthConfig() {
      return {
        headers: { Authorization: `Bearer ${this.bearerToken}` },
      }
    },

    async getCurrentUser(): Promise<boolean> {
      if (!this.bearerToken) return false

      try {
        const res = await axios.get('/api/user/current', this.getAuthConfig())
        this.setUser(res.data.data)
        return true
      } catch (error: unknown) {
        const err = error as AxiosError<{ message: string }>
        // If 401, clear the local session
        if (err.response?.status === 401) {
          this.logout()
        }
        return false
      }
    },

    async login(form: { email: string; password: string }): Promise<boolean> {
      this.loginFailed = false
      try {
        const res = await axios.post('/api/login', {
          email: form.value.email,
          password: form.value.password,
        })

        this.setBearerToken(res.data.data.access_token)
        this.setUser(res.data.data.user)

        router.push('/welcome')
        return true
      } catch (error: unknown) {
        const err = error as AxiosError<{ message: string }>
        showErrorToast(err.response?.data?.message || 'Login failed')
        this.loginFailed = true
        return false
      }
    },

    async logout() {
      try {
        if (this.bearerToken) {
          await axios.post('/api/logout', {}, this.getAuthConfig())
        }
      } catch (e) {
        console.warn("Logout request failed, cleaning local state anyway.")
      } finally {
        this.setBearerToken(null)
        this.setUser(null)
        router.push('/login')
      }
    },

    // Inside stores/auth.ts

    async updatePassword(passwordData: { current_password: string; new_password: string; new_password_confirmation: string }) {
      try {
        const response = await axios.put('/api/profile/password', passwordData, this.getAuthConfig());

        showSuccessToast(response.data.message || 'Password updated successfully!');
        return { success: true };
      } catch (error: any) {
        // Check if Laravel returned a validation error object
        const errors = error.response?.data?.errors;
        const message = error.response?.data?.message;

        if (errors) {
          // Get the first error message from the first field (e.g., "The new password field...")
          const firstField = Object.keys(errors)[0];
          showErrorToast(errors[firstField][0]);
        } else {
          // Fallback for general errors (e.g., 401, 500)
          showErrorToast(message || 'Failed to update password.');
        }

        return { success: false };
      }
    },

    async updateProfileImage(file: File) {
      const formData = new FormData();
      formData.append('image_file', file);
      formData.append('_method', 'PUT');

      const response = await axios.post('/api/profile/image', formData, this.getAuthConfig());
      showSuccessToast(response.data.message || 'Image updated successfully!');

      if (this.user) {
        // Based on your JSON, the image is inside the 'data' object
        this.user.profile_image = response.data.data.profile_image;
      }
    },

    async updateLanguage(languageId: number) {
      try {
        const response = await axios.put(
          '/api/profile/language',
          { language_id: languageId },
          this.getAuthConfig()
        );

        // 1. Show success feedback
        showSuccessToast(response.data.message || 'Language updated successfully!');

        // 2. Update local user state if needed
        if (this.user) {
          this.user.language_id = languageId;
        }

        // 3. Return success
        return { success: true };
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to update language.');
        return { success: false };
      }
    },

    async forgotPassword(email: string) {
      try {
        const response = await axios.post('/api/forgot-password', { email });
        showSuccessToast(response.data.message || 'Reset link sent successfully!');
        return { success: true };
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to send reset link.');
        return { success: false };
      }
    },

    async resetPassword(payload: { email: string; token: string; password: string; password_confirmation: string }) {
      try {
        const response = await axios.post('/api/reset-password', payload);
        showSuccessToast(response.data.message || 'Password reset successfully!');
        return { success: true };
      } catch (error: any) {
        showErrorToast(error.response?.data?.message || 'Failed to reset password.');
        return { success: false };
      }
    },
  },
})
