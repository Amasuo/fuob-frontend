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

    async updateAccount(form: Partial<User>): Promise<boolean> {
      if (!this.bearerToken) return false
      try {
        const res = await axios.patch('/api/account', form, this.getAuthConfig())
        this.setUser(res.data.data)
        showSuccessToast(res.data.message || 'Account updated')
        return true
      } catch (error: unknown) {
        const err = error as AxiosError<{ message: string }>
        showErrorToast(err.response?.data?.message || 'Update failed')
        return false
      }
    },
  },
})
