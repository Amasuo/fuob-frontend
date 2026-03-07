import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export interface Language {
  id: number | null
  name: string
  code: string
}

export const useLanguageStore = defineStore('language', {
  state: () => ({
    languages: [] as Language[],
    loading: false,
  }),

  actions: {
    async fetchLanguages() {
      const authStore = useAuthStore()
      this.loading = true
      try {
        const response = await axios.get('http://localhost/api/language', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
          params: { page: 1, search: '' },
        })

        // Handling both paginated (data.data) and simple array responses
        this.languages = response.data.data || response.data
      } catch (error) {
        console.error('LanguageStore: Error fetching languages', error)
      } finally {
        this.loading = false
      }
    },
  },
})
