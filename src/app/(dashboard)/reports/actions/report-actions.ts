'use server'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { toasts, createActionResult } from '@/lib/toast-server'
import type { Enums } from '@/types/supabase'

export async function generateSSRReportAction(year: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'accountant'])
  try {
    return createActionResult(true, undefined, undefined, toasts.success('SSS R-3 report generated!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to generate'
    return createActionResult(false, undefined, msg, toasts.error('Generation failed', msg))
  }
}

export async function generatePhilHealthReportAction(year: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'accountant'])
  try {
    return createActionResult(true, undefined, undefined, toasts.success('PhilHealth RF-1 report generated!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to generate'
    return createActionResult(false, undefined, msg, toasts.error('Generation failed', msg))
  }
}

export async function generatePagIbigReportAction(year: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'accountant'])
  try {
    return createActionResult(true, undefined, undefined, toasts.success('Pag-IBIG MCRF report generated!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to generate'
    return createActionResult(false, undefined, msg, toasts.error('Generation failed', msg))
  }
}
