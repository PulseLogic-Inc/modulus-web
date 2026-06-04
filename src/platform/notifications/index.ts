import { createAdminSupabaseClient } from '@/lib/supabase/admin'

interface NotificationPayload {
  tenantId: string
  userId: string
  type: string
  title: string
  body: string
  payload?: Record<string, unknown>
}

export async function sendNotification(data: NotificationPayload): Promise<void> {
  const supabase = createAdminSupabaseClient()

  await supabase.from('notifications').insert({
    tenant_id: data.tenantId,
    user_id: data.userId,
    type: data.type,
    title: data.title,
    body: data.body,
    payload: (data.payload ?? null) as never,
  })
}
