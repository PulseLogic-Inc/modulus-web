import {
  findHolidaysByYear,
  findHolidayByDate,
  insertHoliday,
  updateHoliday,
  softDeleteHoliday,
} from '@/domains/hr/repositories/holiday-repository'
import { logAudit } from '@/platform/audit'
import type { HolidayInput } from '@/domains/hr/types'
import type { Database } from '@/types/supabase'

type HolidayRow = Database['public']['Tables']['company_holidays']['Row']

export async function getHolidaysByYear(tenantId: string, year: number): Promise<HolidayRow[]> {
  return findHolidaysByYear(tenantId, year)
}

export async function createHoliday(
  tenantId: string,
  actorId: string,
  data: HolidayInput,
): Promise<HolidayRow> {
  // Business rule: cannot create a custom holiday on same date as an existing statutory holiday
  const existing = await findHolidayByDate(tenantId, data.date)
  if (existing && existing.source === 'statutory') {
    throw new Error(`A statutory holiday already exists on ${data.date}: ${existing.name}`)
  }

  const holiday = await insertHoliday(tenantId, { ...data, source: 'custom' } as HolidayInput)

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'CREATE',
    entity:   'company_holidays',
    entityId: holiday.id,
    newValue: holiday,
  })

  return holiday
}

export async function updateHolidayDetails(
  tenantId: string,
  actorId: string,
  id: string,
  data: Partial<HolidayInput>,
): Promise<HolidayRow> {
  const updated = await updateHoliday(tenantId, id, data)

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'UPDATE',
    entity:   'company_holidays',
    entityId: id,
    newValue: updated,
  })

  return updated
}

export async function deleteHoliday(
  tenantId: string,
  actorId: string,
  id: string,
): Promise<void> {
  await softDeleteHoliday(tenantId, id)
  await logAudit({ tenantId, actor: actorId, action: 'DELETE', entity: 'company_holidays', entityId: id })
}
