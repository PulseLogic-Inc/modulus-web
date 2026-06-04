import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

    const { payroll_run_id } = await req.json()

    if (!payroll_run_id) {
      return new Response(JSON.stringify({ error: 'Missing payroll_run_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch the payroll run
    const { data: run, error: fetchError } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', payroll_run_id)
      .single()

    if (fetchError || !run) {
      return new Response(JSON.stringify({ error: 'Payroll run not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (run.status !== 'generated') {
      return new Response(JSON.stringify({ error: `Cannot finalize a run with status '${run.status}'. Must be 'generated'.` }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Finalization is OWNER-ONLY — hard rule, non-configurable (PAY-008)
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', run.tenant_id)
      .eq('user_id', caller.id)
      .is('deleted_at', null)
      .single()

    if (!membership || membership.role !== 'owner') {
      return new Response(JSON.stringify({ error: 'Forbidden: only the Owner can finalize payroll' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const now = new Date().toISOString()

    // Transition: generated → finalized
    const { error: updateError } = await supabase
      .from('payroll_runs')
      .update({
        status: 'finalized',
        finalized_at: now,
        finalized_by: caller.id,
      })
      .eq('id', payroll_run_id)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create payslip rows for each payroll item (PDF generation deferred to async job)
    const { data: items } = await supabase
      .from('payroll_items')
      .select('id, employee_id')
      .eq('payroll_run_id', payroll_run_id)

    if (items && items.length > 0) {
      const payslips = items.map((item: { id: string; employee_id: string }) => ({
        tenant_id: run.tenant_id,
        payroll_item_id: item.id,
        employee_id: item.employee_id,
        payroll_run_id,
        status: 'active',
        generated_at: now,
      }))

      await supabase.from('payslips').insert(payslips)
    }

    // Lock all payroll_ready timekeeping records for this period to 'locked'
    const { data: period } = await supabase
      .from('payroll_periods')
      .select('start_date, end_date')
      .eq('id', run.payroll_period_id)
      .single()

    if (period) {
      await supabase
        .from('timekeeping_records')
        .update({ status: 'locked' })
        .eq('tenant_id', run.tenant_id)
        .eq('status', 'payroll_ready')
        .gte('date', period.start_date)
        .lte('date', period.end_date)
    }

    // Write audit log with full snapshot
    await supabase.from('audit_logs').insert({
      tenant_id: run.tenant_id,
      actor: caller.id,
      action: 'FINALIZE',
      entity: 'payroll_runs',
      entity_id: payroll_run_id,
      old_value: { status: 'generated' },
      new_value: {
        status: 'finalized',
        finalized_at: now,
        total_gross_centavos: run.total_gross_centavos,
        total_net_centavos: run.total_net_centavos,
        employee_count: run.employee_count,
      },
    })

    return new Response(JSON.stringify({ finalized: true, payslips_created: items?.length ?? 0 }), {
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
