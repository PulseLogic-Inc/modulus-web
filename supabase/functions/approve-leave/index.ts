import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const EVENT_BASED_TYPES = ['ml', 'pl']

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

    const { leave_request_id } = await req.json()

    if (!leave_request_id) {
      return new Response(JSON.stringify({ error: 'Missing leave_request_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch leave request
    const { data: leaveRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', leave_request_id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !leaveRequest) {
      return new Response(JSON.stringify({ error: 'Leave request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (leaveRequest.status !== 'pending') {
      return new Response(JSON.stringify({ error: `Cannot approve a request with status '${leaveRequest.status}'` }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Separation of duties
    if (leaveRequest.requested_by === caller.id) {
      return new Response(JSON.stringify({ error: 'Approver cannot be the same as requester' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify caller role
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', leaveRequest.tenant_id)
      .eq('user_id', caller.id)
      .is('deleted_at', null)
      .single()

    if (!membership || !['owner', 'hr_admin'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: insufficient role' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Balance check for accrual-based leave types (sil, vl, sl)
    if (!EVENT_BASED_TYPES.includes(leaveRequest.leave_type)) {
      const { data: ledgerRows } = await supabase
        .from('leave_ledger')
        .select('days')
        .eq('employee_id', leaveRequest.employee_id)
        .eq('leave_type', leaveRequest.leave_type)

      const balance = (ledgerRows ?? []).reduce((sum: number, row: { days: number }) => sum + Number(row.days), 0)
      if (balance < leaveRequest.days) {
        return new Response(JSON.stringify({
          error: `Insufficient leave balance. Available: ${balance} days, Requested: ${leaveRequest.days} days`,
        }), {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Approve the leave request
    const { error: updateError } = await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        reviewed_by: caller.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', leave_request_id)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Deduct balance via ledger entry (accrual-based types only)
    if (!EVENT_BASED_TYPES.includes(leaveRequest.leave_type)) {
      await supabase.from('leave_ledger').insert({
        tenant_id: leaveRequest.tenant_id,
        employee_id: leaveRequest.employee_id,
        leave_type: leaveRequest.leave_type,
        entry_type: 'usage',
        days: -leaveRequest.days,
        reference_id: leave_request_id,
        notes: `Leave request approved by ${caller.id}`,
      })
    }

    // Create timekeeping records for each leave date with status 'on_leave'
    const start = new Date(leaveRequest.start_date)
    const end = new Date(leaveRequest.end_date)
    const leaveRecords = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      leaveRecords.push({
        tenant_id: leaveRequest.tenant_id,
        employee_id: leaveRequest.employee_id,
        date: d.toISOString().split('T')[0],
        status: 'on_leave',
        worked_minutes: 0,
      })
    }

    if (leaveRecords.length > 0) {
      await supabase
        .from('timekeeping_records')
        .upsert(leaveRecords, { onConflict: 'tenant_id,employee_id,date', ignoreDuplicates: true })
    }

    // Write audit log
    await supabase.from('audit_logs').insert({
      tenant_id: leaveRequest.tenant_id,
      actor: caller.id,
      action: 'APPROVE',
      entity: 'leave_requests',
      entity_id: leave_request_id,
      old_value: { status: 'pending' },
      new_value: { status: 'approved' },
    })

    return new Response(JSON.stringify({ approved: true }), {
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
