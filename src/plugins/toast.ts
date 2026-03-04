import { toast } from 'vue3-toastify'
import type { TypeOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const DEFAULT_DURATION = 2000
const DEFAULT_OPTIONS = {
  autoClose: DEFAULT_DURATION,
  hideProgressBar: true,
}

export function showSuccessToast(message: string) {
  toast(message, { ...DEFAULT_OPTIONS, type: 'success' as TypeOptions })
}

export function showInfoToast(message: string) {
  toast(message, { ...DEFAULT_OPTIONS, type: 'info' as TypeOptions })
}

export function showWarningToast(message: string) {
  toast(message, { ...DEFAULT_OPTIONS, type: 'warning' as TypeOptions })
}

export function showErrorToast(message: string) {
  toast(message, { ...DEFAULT_OPTIONS, type: 'error' as TypeOptions })
}

export function showDefaultToast(message: string) {
  toast(message, { ...DEFAULT_OPTIONS, type: 'default' as TypeOptions })
}
