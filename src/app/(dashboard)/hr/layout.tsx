import Link from 'next/link'
import { requireTenant } from '@/platform/tenants'
import { hasRole } from '@/platform/permissions'
import type { Enums } from '@/types/supabase'

const TABS = [
  { href: '/hr',                          label: 'Employees',      roles: null },
  { href: '/hr/settings/work-locations',  label: 'Settings',       roles: ['owner', 'hr_admin'] as Enums<'user_role'>[] },
]

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireTenant()

  const visibleTabs = TABS.filter(
    (t) => t.roles === null || hasRole(role as Enums<'user_role'>, t.roles)
  )

  return (
    <div>
      {/* HR module secondary navigation */}
      <div className="border-b mb-8">
        <nav className="flex gap-1">
          {visibleTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border transition-colors"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  )
}
