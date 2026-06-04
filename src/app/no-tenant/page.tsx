import { signOutAction } from '@/app/(auth)/sign-in/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

export default function NoTenantPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-xl border bg-card shadow-sm">
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-destructive fa-lg" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              No workspace access
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Your account is not linked to any workspace. Contact your system administrator
            to be added to your company&apos;s Modulus account.
          </p>
          <form action={signOutAction}>
            <Button variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
