import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  // Always refresh session so it doesn't expire mid-session
  // Gracefully handle missing refresh tokens (first visit, expired session, etc.)
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error) {
      user = data.user
    }
  } catch (err) {
    // Refresh token not found or invalid — this is normal on first visit
    // User will be redirected to sign-in if accessing protected routes
  }

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/forgot-password')
  const isCallbackRoute = pathname.startsWith('/auth/') || pathname === '/auth/callback'
  const isNoTenantRoute = pathname.startsWith('/no-tenant')
  const isPublicRoute = isAuthRoute || isCallbackRoute || isNoTenantRoute

  if (!isPublicRoute && !user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/hr', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
