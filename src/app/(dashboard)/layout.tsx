import { requireTenant } from '@/platform/tenants'
import { signOutAction } from '@/app/(auth)/sign-in/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faMoneyBillWave,
  faClock,
  faCalendarDays,
  faBarsProgress,
  faChartLine,
  faRightFromBracket,
  faBuildingColumns,
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/hr', icon: faUsers, label: 'HR', module: 'hr' },
  { href: '/timekeeping', icon: faClock, label: 'Timekeeping', module: 'timekeeping' },
  { href: '/leaves', icon: faCalendarDays, label: 'Leaves', module: 'leave' },
  { href: '/overtime', icon: faBarsProgress, label: 'Overtime', module: 'overtime' },
  { href: '/payroll', icon: faMoneyBillWave, label: 'Payroll', module: 'payroll' },
  { href: '/reports', icon: faChartLine, label: 'Reports', module: 'compliance' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { tenant, role } = await requireTenant()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        {/* Logo / Tenant */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FontAwesomeIcon icon={faBuildingColumns} className="text-primary-foreground fa-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-foreground truncate">
                {(tenant as { name?: string })?.name ?? 'Modulus'}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <FontAwesomeIcon icon={item.icon} className="fa-sm w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Separator />

        {/* Sign out */}
        <div className="p-4">
          <form action={signOutAction}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-muted-foreground">
              <FontAwesomeIcon icon={faRightFromBracket} className="fa-sm" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
