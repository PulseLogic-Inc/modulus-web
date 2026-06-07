'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { useActionToast } from '@/hooks/use-action-toast'
import { createShiftPolicyAction, updateShiftPolicyAction } from './actions/shift-policy-actions'
import type { ActionResult } from '@/lib/toast-server'
import type { Database } from '@/types/supabase'

type ShiftPolicyWithDays = Database['public']['Tables']['shift_policies']['Row'] & {
  shift_policy_days: Database['public']['Tables']['shift_policy_days']['Row'][]
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface ShiftPolicyFormProps {
  mode:   'create' | 'edit'
  policy?: ShiftPolicyWithDays
}

interface DaySchedule {
  day_of_week: number
  start_time: string
  end_time: string
  is_rest_day: boolean
  break_minutes: number
  break_paid: boolean
}

export function ShiftPolicyForm({ mode, policy }: ShiftPolicyFormProps) {
  const handleToast = useActionToast()

  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await (mode === 'edit' && policy
        ? updateShiftPolicyAction(policy.id, prev, formData)
        : createShiftPolicyAction(prev, formData))
      handleToast(result)
      return result
    },
    null
  )

  // Initialize day schedules from policy or defaults
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(() => {
    if (mode === 'edit' && policy?.shift_policy_days) {
      return policy.shift_policy_days
        .sort((a, b) => a.day_of_week - b.day_of_week)
        .map((d) => ({
          day_of_week: d.day_of_week,
          start_time: d.start_time,
          end_time: d.end_time,
          is_rest_day: d.is_rest_day,
          break_minutes: d.break_minutes,
          break_paid: d.break_paid,
        }))
    }
    // Default: Mon-Sat 8AM-5PM, Sun rest day
    return [
      { day_of_week: 0, start_time: '', end_time: '', is_rest_day: true, break_minutes: 60, break_paid: false },
      { day_of_week: 1, start_time: '08:00', end_time: '17:00', is_rest_day: false, break_minutes: 60, break_paid: false },
      { day_of_week: 2, start_time: '08:00', end_time: '17:00', is_rest_day: false, break_minutes: 60, break_paid: false },
      { day_of_week: 3, start_time: '08:00', end_time: '17:00', is_rest_day: false, break_minutes: 60, break_paid: false },
      { day_of_week: 4, start_time: '08:00', end_time: '17:00', is_rest_day: false, break_minutes: 60, break_paid: false },
      { day_of_week: 5, start_time: '08:00', end_time: '17:00', is_rest_day: false, break_minutes: 60, break_paid: false },
      { day_of_week: 6, start_time: '08:00', end_time: '17:00', is_rest_day: false, break_minutes: 60, break_paid: false },
    ]
  })

  const updateDaySchedule = (dayOfWeek: number, field: keyof DaySchedule, value: unknown) => {
    setDaySchedules((prev) =>
      prev.map((d) =>
        d.day_of_week === dayOfWeek ? { ...d, [field]: value } : d
      )
    )
  }

  return (
    <form action={action} className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-sm font-semibold text-foreground">Basic Information</p>

        <div className="space-y-2">
          <Label htmlFor="name">Policy Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={policy?.name ?? ''}
            placeholder="e.g. Standard Day Shift"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grace_period_min">Grace Period (minutes)</Label>
            <Input
              id="grace_period_min"
              name="grace_period_min"
              type="number"
              min="0"
              max="60"
              defaultValue={policy?.grace_period_min ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ot_threshold_min">OT Threshold (minutes)</Label>
            <Input
              id="ot_threshold_min"
              name="ot_threshold_min"
              type="number"
              min="0"
              max="1440"
              defaultValue={policy?.ot_threshold_min ?? 480}
            />
            <p className="text-xs text-muted-foreground">480 = 8 hours</p>
          </div>
        </div>
      </div>

      {/* Night Differential */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Night Differential</p>
            <p className="text-xs text-muted-foreground mt-1">Enable 10% additional pay for night shifts</p>
          </div>
          <Switch
            name="night_diff_enabled"
            defaultChecked={policy?.night_diff_enabled ?? false}
            onCheckedChange={(checked) => {
              document.querySelector<HTMLInputElement>('[name="night_diff_enabled"]')!.value = String(checked)
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="night_diff_start">Start Time</Label>
            <Input
              id="night_diff_start"
              name="night_diff_start"
              type="time"
              defaultValue={policy?.night_diff_start ?? '22:00'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="night_diff_end">End Time</Label>
            <Input
              id="night_diff_end"
              name="night_diff_end"
              type="time"
              defaultValue={policy?.night_diff_end ?? '06:00'}
            />
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-sm font-semibold text-foreground">Weekly Schedule</p>

        <div className="space-y-3">
          {daySchedules.map((day) => (
            <Card key={day.day_of_week} className="rounded-lg border bg-background p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{DAY_NAMES[day.day_of_week]}</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={day.is_rest_day}
                      onCheckedChange={(checked) => updateDaySchedule(day.day_of_week, 'is_rest_day', checked)}
                    />
                    <span className="text-xs text-muted-foreground">Rest Day</span>
                  </label>
                </div>

                {!day.is_rest_day && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`day_${day.day_of_week}_start_time`} className="text-xs">
                        Start
                      </Label>
                      <Input
                        id={`day_${day.day_of_week}_start_time`}
                        name={`day_${day.day_of_week}_start_time`}
                        type="time"
                        value={day.start_time}
                        onChange={(e) => updateDaySchedule(day.day_of_week, 'start_time', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`day_${day.day_of_week}_end_time`} className="text-xs">
                        End
                      </Label>
                      <Input
                        id={`day_${day.day_of_week}_end_time`}
                        name={`day_${day.day_of_week}_end_time`}
                        type="time"
                        value={day.end_time}
                        onChange={(e) => updateDaySchedule(day.day_of_week, 'end_time', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`day_${day.day_of_week}_break_minutes`} className="text-xs">
                        Break (min)
                      </Label>
                      <Input
                        id={`day_${day.day_of_week}_break_minutes`}
                        name={`day_${day.day_of_week}_break_minutes`}
                        type="number"
                        min="0"
                        max="240"
                        value={day.break_minutes}
                        onChange={(e) => updateDaySchedule(day.day_of_week, 'break_minutes', Number(e.target.value))}
                      />
                    </div>

                    <label className="flex items-center gap-2 justify-between col-span-2 cursor-pointer">
                      <span className="text-xs text-muted-foreground">Paid Break</span>
                      <Switch
                        checked={day.break_paid}
                        onCheckedChange={(checked) => updateDaySchedule(day.day_of_week, 'break_paid', checked)}
                      />
                    </label>
                  </div>
                )}

                {/* Hidden inputs for form submission */}
                <input type="hidden" name={`day_${day.day_of_week}_is_rest_day`} value={String(day.is_rest_day)} />
                <input type="hidden" name={`day_${day.day_of_week}_start_time`} value={day.is_rest_day ? '' : day.start_time} />
                <input type="hidden" name={`day_${day.day_of_week}_end_time`} value={day.is_rest_day ? '' : day.end_time} />
                <input type="hidden" name={`day_${day.day_of_week}_break_minutes`} value={String(day.break_minutes)} />
                <input type="hidden" name={`day_${day.day_of_week}_break_paid`} value={String(day.break_paid)} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Saving…' : mode === 'create' ? 'Create Policy' : 'Save Changes'}
        </Button>
        <Link href="/hr/settings/shift-policies">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  )
}
