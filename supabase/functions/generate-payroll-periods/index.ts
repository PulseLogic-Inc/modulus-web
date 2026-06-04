import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface GeneratePeriodsPayload {
  tenant_id: string
  months_ahead?: number
}

// Semi-monthly period codes: 'August 2026 - Cutoff 1', 'August 2026 - Cutoff 2'
function buildSemiMonthlyPeriods(tenant_id: string, monthsAhead: number) {
  const periods = []
  const now = new Date()

  for (let m = 0; m <= monthsAhead; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() + m, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const monthName = d.toLocaleString('en-US', { month: 'long' })

    // Cutoff 1: 1st–15th, payday 21st
    periods.push({
      tenant_id,
      cadence: 'semi_monthly',
      period_code: `${monthName} ${year} - Cutoff 1`,
      start_date: new Date(year, month, 1).toISOString().split('T')[0],
      end_date: new Date(year, month, 15).toISOString().split('T')[0],
      payday: new Date(year, month, 21).toISOString().split('T')[0],
      status: 'draft',
    })

    // Cutoff 2: 16th–last day, payday 6th of next month
    const lastDay = new Date(year, month + 1, 0).getDate()
    periods.push({
      tenant_id,
      cadence: 'semi_monthly',
      period_code: `${monthName} ${year} - Cutoff 2`,
      start_date: new Date(year, month, 16).toISOString().split('T')[0],
      end_date: new Date(year, month, lastDay).toISOString().split('T')[0],
      payday: new Date(year, month + 1, 6).toISOString().split('T')[0],
      status: 'draft',
    })
  }

  return periods
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { authorization: authHeader } } },
    )

    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { tenant_id, months_ahead = 6 }: GeneratePeriodsPayload = await req.json()

    // Verify caller has owner or hr_admin role in the tenant
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', caller.id)
      .is('deleted_at', null)
      .single()

    if (!membership || !['owner', 'hr_admin'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch tenant's payroll cadence
    const { data: tenant } = await supabase
      .from('tenants')
      .select('payroll_cadence')
      .eq('id', tenant_id)
      .single()

    const cadence = tenant?.payroll_cadence ?? 'semi_monthly'

    let periods: Record<string, unknown>[] = []
    if (cadence === 'semi_monthly') {
      periods = buildSemiMonthlyPeriods(tenant_id, months_ahead)
    }
    // TODO: implement weekly, bi_weekly, monthly cadence builders

    if (periods.length === 0) {
      return new Response(JSON.stringify({ created: 0, message: `Cadence '${cadence}' not yet implemented` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Upsert — idempotent; skip periods that already exist (conflict on period_code)
    const { data, error } = await supabase
      .from('payroll_periods')
      .upsert(periods, { onConflict: 'tenant_id,period_code', ignoreDuplicates: true })
      .select()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ created: data?.length ?? 0 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
