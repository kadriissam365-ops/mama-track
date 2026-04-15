import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicPaths = ['/auth/login', '/auth/signup', '/auth/callback', '/auth/forgot-password', '/auth/reset-password', '/onboarding', '/invite', '/mentions-legales', '/confidentialite', '/cgu']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isHomePage = request.nextUrl.pathname === '/'

  if (!user && !isPublicPath && !isHomePage) {
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  const authOnlyRedirectExceptions = ['/auth/callback', '/auth/reset-password', '/auth/forgot-password']
  if (
    user &&
    isPublicPath &&
    !authOnlyRedirectExceptions.some(p => request.nextUrl.pathname.startsWith(p))
  ) {
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|sw\\.js|manifest\\.json).*)',
  ],
}
