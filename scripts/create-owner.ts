/**
 * Bootstrap script: creates the first Owner account for a tenant.
 *
 * Usage:
 *   bun run scripts/create-owner.ts <email> [tenant_id]
 *
 * Examples:
 *   bun run scripts/create-owner.ts admin@devcompany.com
 *   bun run scripts/create-owner.ts admin@devcompany.com 00000000-0000-0000-0000-000000000001
 *
 * If tenant_id is omitted, defaults to the dev tenant seed ID.
 * The user will receive an invite email with a link to set their password.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'

const DEV_TENANT_ID = '00000000-0000-0000-0000-000000000001'

async function main() {
  const email = process.argv[2]
  const tenantId = process.argv[3] ?? DEV_TENANT_ID

  if (!email) {
    console.error('Usage: bun run scripts/create-owner.ts <email> [tenant_id]')
    process.exit(1)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`\nCreating Owner account for ${email} in tenant ${tenantId}...\n`)

  // Step 1: Check tenant exists — create it if this is the dev tenant and it's missing
  let { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('id', tenantId)
    .single()

  if (!tenant) {
    if (tenantId !== DEV_TENANT_ID) {
      console.error(`Tenant ${tenantId} not found.`)
      process.exit(1)
    }

    console.log('Dev tenant not found — creating it...')
    const { data: created, error: createError } = await supabase
      .from('tenants')
      .insert({ id: DEV_TENANT_ID, name: 'Dev Company', slug: 'dev-company' })
      .select('id, name')
      .single()

    if (createError || !created) {
      console.error(`Failed to create tenant: ${createError?.message}`)
      process.exit(1)
    }

    // Enable all MVP modules for dev tenant
    await supabase.from('tenant_modules').insert([
      { tenant_id: DEV_TENANT_ID, module: 'hr' },
      { tenant_id: DEV_TENANT_ID, module: 'payroll' },
      { tenant_id: DEV_TENANT_ID, module: 'timekeeping' },
      { tenant_id: DEV_TENANT_ID, module: 'leave' },
      { tenant_id: DEV_TENANT_ID, module: 'overtime' },
      { tenant_id: DEV_TENANT_ID, module: 'compliance' },
    ])

    tenant = created
    console.log(`✓ Dev tenant created: ${tenant.name}`)
  } else {
    console.log(`✓ Tenant found: ${tenant.name}`)
  }

  // Step 2: Check no owner already exists for this tenant
  const { data: existingOwner } = await supabase
    .from('tenant_memberships')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('role', 'owner')
    .is('deleted_at', null)
    .single()

  if (existingOwner) {
    console.error(`An Owner already exists for tenant ${tenantId}. Use invite-user edge function to add additional users.`)
    process.exit(1)
  }

  // Step 3: Invite user via Supabase Auth (sends invite email)
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback?next=/hr`,
    }
  )

  if (inviteError) {
    console.error(`Failed to invite user: ${inviteError.message}`)
    process.exit(1)
  }

  console.log(`✓ Invite sent to ${email}`)

  // Step 4: Create tenant membership as Owner
  const { error: membershipError } = await supabase.from('tenant_memberships').insert({
    tenant_id: tenantId,
    user_id: inviteData.user.id,
    role: 'owner',
  })

  if (membershipError) {
    console.error(`Failed to create membership: ${membershipError.message}`)
    // Attempt cleanup: delete the invited user
    await supabase.auth.admin.deleteUser(inviteData.user.id)
    process.exit(1)
  }

  console.log(`✓ Owner membership created`)
  console.log(`\n✅ Done!`)
  console.log(`\n   Email:   ${email}`)
  console.log(`   Tenant:  ${tenant.name} (${tenantId})`)
  console.log(`   Role:    Owner`)
  console.log(`\n   The user will receive an invite email.`)
  console.log(`   They must click the link to set their password before they can sign in.\n`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
