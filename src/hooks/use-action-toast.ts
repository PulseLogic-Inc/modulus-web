'use client'

import { toast } from 'sonner'
import type { ActionResult, ToastMessage } from '@/lib/toast-server'

/**
 * Hook to handle toast messages from server actions
 *
 * Usage in form component:
 *   const handleToast = useActionToast()
 *
 *   const [_state, action] = useActionState(
 *     async (prev, formData) => {
 *       const result = await submitAction(formData)
 *       handleToast(result)
 *       return result
 *     },
 *     null
 *   )
 */
export function useActionToast() {
  return function handleToast(result: ActionResult | null) {
    if (!result?.toast) return

    const { type, message, description } = result.toast

    switch (type) {
      case 'success':
        toast.success(message, { description })
        break
      case 'error':
        toast.error(message, { description })
        break
      case 'info':
        toast.info(message, { description })
        break
      case 'warning':
        toast.warning(message, { description })
        break
      case 'loading':
        toast.loading(message, { description })
        break
    }
  }
}

/**
 * Trigger a quick toast directly (for non-action toast usage)
 */
export function triggerToast(type: string, message: string, description?: string) {
  toast[type as keyof typeof toast](message, { description })
}
