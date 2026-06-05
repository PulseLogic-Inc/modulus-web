import {
  findAllWorkLocations,
  findWorkLocationById,
  insertWorkLocation,
  updateWorkLocation,
  softDeleteWorkLocation,
} from '@/domains/hr/repositories/work-location-repository'
import { logAudit } from '@/platform/audit'
import type { WorkLocationInput } from '@/domains/hr/types'
import type { Database } from '@/types/supabase'

type WorkLocationRow = Database['public']['Tables']['work_locations']['Row']

export async function getWorkLocations(tenantId: string): Promise<WorkLocationRow[]> {
  return findAllWorkLocations(tenantId)
}

export async function createWorkLocation(
  tenantId: string,
  actorId: string,
  data: WorkLocationInput,
): Promise<WorkLocationRow> {
  const location = await insertWorkLocation(tenantId, data)

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'CREATE',
    entity:   'work_locations',
    entityId: location.id,
    newValue: location,
  })

  return location
}

export async function updateWorkLocationDetails(
  tenantId: string,
  actorId: string,
  id: string,
  data: Partial<WorkLocationInput>,
): Promise<WorkLocationRow> {
  const existing = await findWorkLocationById(tenantId, id)
  if (!existing) throw new Error('Work location not found')

  const updated = await updateWorkLocation(tenantId, id, data)

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'UPDATE',
    entity:   'work_locations',
    entityId: id,
    oldValue: existing,
    newValue: updated,
  })

  return updated
}

export async function deactivateWorkLocation(
  tenantId: string,
  actorId: string,
  id: string,
): Promise<void> {
  const existing = await findWorkLocationById(tenantId, id)
  if (!existing) throw new Error('Work location not found')

  await softDeleteWorkLocation(tenantId, id)

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'DEACTIVATE',
    entity:   'work_locations',
    entityId: id,
    oldValue: existing,
  })
}
