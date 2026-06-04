import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const MAX_REOPENS = 3

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

    const { payroll_run_id, reason } = await req.json()

    if (!payroll_run_id || !reason) {
      return new Response(JSON.stringify({ error: 'Missing payroll_run_id or reason' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (reason.length < 50) {
      return new Response(JSON.stringify({ error: 'Reason must be at least 50 characters' }), {
        status: 422,
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

    if (run.status !== 'finalized') {
      return new Response(JSON.stringify({ error: `Cannot reopen a run with status '${run.status}'. Must be 'finalized'.` }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (run.reopen_count >= MAX_REOPENS) {
      return new Response(JSON.stringify({ error: `This payroll run has been reopened the maximum number of times (${MAX_REOPENS}). Contact support.` }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Reopen is OWNER-ONLY
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', run.tenant_id)
      .eq('user_id', caller.id)
      .is('deleted_at', null)
      .single()

    if (!membership || membership.role !== 'owner') {
      return new Response(JSON.stringify({ error: 'Forbidden: only the Owner can reopen a finalized payroll run' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Transition: finalized → draft; increment reopen_count
    const { error: updateError } = await supabase
      .from('payroll_runs')
      .update({
        status: 'draft',
        finalized_at: null,
        finalized_by: null,
        reopen_count: run.reopen_count + 1,
      })
      .eq('id', payroll_run_id)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Void all payslips for this run (not deleted; marked voided for audit trail)
    await supabase
      .from('payslips')
      .update({
        status: 'voided',
        voided_at: new Date().toISOString(),
        void_reason: `Payroll run reopened by owner. Reason: ${reason}`,
      })
      .eq('payroll_run_id', payroll_run_id)
      .eq('status', 'active')

    // Unlock timekeeping records (revert 'locked' → 'payroll_ready')
    const { data: period } = await supabase
      .from('payroll_periods')
      .select('start_date, end_date')
      .eq('id', run.payroll_period_id)
      .single()

    if (period) {
      await supabase
        .from('timekeeping_records')
        .update({ status: 'payroll_ready' })
        .eq('tenant_id', run.tenant_id)
        .eq('status', 'locked')
        .gte('date', period.start_date)
        .lte('date', period.end_date)
    }

    // Write audit log with full snapshot
    await supabase.from('audit_logs').insert({
      tenant_id: run.tenant_id,
      actor: caller.id,
      action: 'REOPEN',
      entity: 'payroll_runs',
      entity_id: payroll_run_id,
      old_value: {
        status: 'finalized',
        finalized_at: run.finalized_at,
        reopen_count: run.reopen_count,
      },
      new_value: {
        status: 'draft',
        reopen_count: run.reopen_count + 1,
      },
      reason,
    })

    return new Response(JSON.stringify({ reopened: true, reopen_count: run.reopen_count + 1 }), {
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
