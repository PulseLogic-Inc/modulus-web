import Link from 'next/link'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import type { Enums } from '@/types/supabase'

const SETTINGS_TABS = [
  { href: '/hr/settings/work-locations', label: 'Work Locations' },
  { href: '/hr/settings/job-titles',     label: 'Job Titles' },
  { href: '/hr/settings/shift-policies', label: 'Shift Policies' },
  { href: '/hr/settings/holidays',       label: 'Holidays' },
]

export default async function HRSettingsLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold tracking-wider uppercase text-primary mb-1">HR</p>
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight text-foreground">Settings</h1>
      </div>

      {/* Settings sub-navigation */}
      <div className="flex gap-2 mb-8 border-b">
        {SETTINGS_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border transition-colors"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}
