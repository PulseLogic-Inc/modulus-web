/**
 * Toast utilities for server actions
 *
 * Since Sonner works on the client, we return toast instructions from server actions
 * and trigger them on the client side using useEffect or after action completion.
 *
 * Usage in server action:
 *   return { success: true, toast: { type: 'success', message: 'Created!' } }
 *
 * Usage in form action:
 *   const result = await action(formData)
 *   if (result?.toast) {
 *     toast[result.toast.type](result.toast.message)
 *   }
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

export interface ToastMessage {
  type: ToastType
  message: string
  description?: string
}

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  toast?: ToastMessage
}

/**
 * Helper to create action result with toast
 */
export function createActionResult<T = unknown>(
  success: boolean,
  data?: T,
  error?: string,
  toast?: ToastMessage,
): ActionResult<T> {
  return {
    success,
    data,
    error,
    toast,
  }
}

/**
 * Common toast presets
 */
export const toasts = {
  success: (message: string, description?: string): ToastMessage => ({
    type: 'success',
    message,
    description,
  }),
  error: (message: string, description?: string): ToastMessage => ({
    type: 'error',
    message,
    description,
  }),
  info: (message: string, description?: string): ToastMessage => ({
    type: 'info',
    message,
    description,
  }),
  warning: (message: string, description?: string): ToastMessage => ({
    type: 'warning',
    message,
    description,
  }),
}
