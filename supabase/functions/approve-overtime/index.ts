import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ApproveOvertimePayload {
  overtime_request_id: string
  adjusted_hours?: number
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

    const { overtime_request_id, adjusted_hours }: ApproveOvertimePayload = await req.json()

    if (!overtime_request_id) {
      return new Response(JSON.stringify({ error: 'Missing overtime_request_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch the OT request
    const { data: otRequest, error: fetchError } = await supabase
      .from('overtime_requests')
      .select('*, employees(work_location_id)')
      .eq('id', overtime_request_id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !otRequest) {
      return new Response(JSON.stringify({ error: 'OT request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (otRequest.status !== 'pending') {
      return new Response(JSON.stringify({ error: `Cannot approve a request with status '${otRequest.status}'` }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Separation of duties: approver cannot be the requester
    if (otRequest.requested_by === caller.id) {
      return new Response(JSON.stringify({ error: 'Approver cannot be the same as requester' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify caller has owner or hr_admin role in the tenant
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', otRequest.tenant_id)
      .eq('user_id', caller.id)
      .is('deleted_at', null)
      .single()

    if (!membership || !['owner', 'hr_admin'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: insufficient role' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const finalHours = adjusted_hours ?? otRequest.ot_hours

    // Compute estimated cost: hours × (daily_rate ÷ 8) × multiplier
    const { data: rateRow } = await supabase
      .from('employee_rates')
      .select('rate_centavos, compensation_type')
      .eq('employee_id', otRequest.employee_id)
      .is('effective_to', null)
      .single()

    let estimatedCostCentavos: number | null = null
    if (rateRow) {
      const hourlyRateCentavos = rateRow.compensation_type === 'daily'
        ? Math.round(rateRow.rate_centavos / 8)
        : Math.round(rateRow.rate_centavos / 30 / 8)
      estimatedCostCentavos = Math.round(hourlyRateCentavos * finalHours * Number(otRequest.multiplier))
    }

    // Update OT request to approved
    const { data: updated, error: updateError } = await supabase
      .from('overtime_requests')
      .update({
        status: 'approved',
        ot_hours: finalHours,
        reviewed_by: caller.id,
        reviewed_at: new Date().toISOString(),
        estimated_cost_centavos: estimatedCostCentavos,
      })
      .eq('id', overtime_request_id)
      .select()
      .single()

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Write audit log
    await supabase.from('audit_logs').insert({
      tenant_id: otRequest.tenant_id,
      actor: caller.id,
      action: 'APPROVE',
      entity: 'overtime_requests',
      entity_id: overtime_request_id,
      old_value: { status: 'pending' },
      new_value: { status: 'approved', estimated_cost_centavos: estimatedCostCentavos },
    })

    return new Response(JSON.stringify({ overtime_request: updated, estimated_cost_centavos: estimatedCostCentavos }), {
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
