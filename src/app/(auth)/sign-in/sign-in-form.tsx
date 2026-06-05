'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { signInAction } from './actions/auth-actions'

export function SignInForm() {
  const [state, action, isPending] = useActionState(signInAction, null)

  return (
    <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <CardHeader className="p-8 pb-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <FontAwesomeIcon icon={faRightToBracket} className="text-primary fa-lg" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Sign in to Modulus ERP
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          Enter your credentials to access your workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8">
        <form action={action} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground fa-sm"
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="pl-9"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground fa-sm"
              />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="pl-9"
                disabled={isPending}
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive font-medium">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* No "Create Account" link — invite-only per AUTH-003 */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Contact your system administrator to create an account.
        </p>
      </CardContent>
    </Card>
  )
}
