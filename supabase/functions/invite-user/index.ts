import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface InviteUserPayload {
  email: string
  tenant_id: string
  role: 'owner' | 'hr_admin' | 'manager' | 'employee'
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

    // Verify caller is authenticated and has owner or hr_admin role in the tenant
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

    const { email, tenant_id, role }: InviteUserPayload = await req.json()

    if (!email || !tenant_id || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, tenant_id, role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Confirm caller has permission to invite (owner or hr_admin in this tenant)
    const { data: callerMembership, error: membershipError } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', caller.id)
      .is('deleted_at', null)
      .single()

    if (membershipError || !callerMembership) {
      return new Response(JSON.stringify({ error: 'Forbidden: you are not a member of this tenant' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!['owner', 'hr_admin'].includes(callerMembership.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: insufficient role to invite users' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Invite the user via Supabase Auth (sends invite email)
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email)
    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create tenant membership for the invited user
    const { data: membership, error: createError } = await supabase
      .from('tenant_memberships')
      .insert({
        tenant_id,
        user_id: inviteData.user.id,
        role,
      })
      .select()
      .single()

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ membership }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
