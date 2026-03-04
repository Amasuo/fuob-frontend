declare module 'vue3-toastify' {
  import { Component } from 'vue'

  export type TypeOptions = 'success' | 'info' | 'warning' | 'error' | 'default'

  export interface ToastOptions {
    autoClose?: number
    hideProgressBar?: boolean
    type?: TypeOptions
    [key: string]: any
  }

  export function toast(message: string, options?: ToastOptions): void
}
