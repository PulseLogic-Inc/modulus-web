'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

// Handles both auth flows:
// 1. Implicit flow (invite emails) — tokens arrive in the URL hash: #access_token=...
//    The @supabase/ssr browser client auto-detects these and creates a session.
// 2. PKCE flow (password reset, OAuth) — code arrives as ?code=...
export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    const next = searchParams.get('next') ?? '/hr'

    // The browser client auto-detects hash tokens on initialization.
    // Give it a moment to process, then check the session.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        router.replace(next)
        return
      }

      // Fallback: handle PKCE code exchange
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace(next)
          return
        }
      }

      router.replace('/sign-in?error=auth_callback_failed')
    })
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}
