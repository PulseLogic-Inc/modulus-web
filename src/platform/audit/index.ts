import { createAdminSupabaseClient } from '@/lib/supabase/admin'

interface AuditPayload {
  tenantId: string
  actor: string
  action: string
  entity: string
  entityId?: string
  oldValue?: unknown
  newValue?: unknown
  reason?: string
}

export async function logAudit(payload: AuditPayload): Promise<void> {
  const supabase = createAdminSupabaseClient()

  await supabase.from('audit_logs').insert({
    tenant_id: payload.tenantId,
    actor: payload.actor,
    action: payload.action,
    entity: payload.entity,
    entity_id: payload.entityId ?? null,
    old_value: payload.oldValue != null ? payload.oldValue as never : null,
    new_value: payload.newValue != null ? payload.newValue as never : null,
    reason: payload.reason ?? null,
  })
}
