import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware first to handle locale redirection and rewriting
  const intlResponse = intlMiddleware(request);

  // If next-intl redirects, we should return that response immediately
  if (intlResponse.headers.has('Location')) {
    return intlResponse;
  }

  // 2. Initialize Supabase client
  // We need to copy cookies from the request to the response, but we also need to respect
  // any headers/cookies set by next-intl middleware.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Copy headers from intlResponse if any (though usually it just rewrites)
  intlResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
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

  // Extract locale from pathname to correctly handle redirects
  // e.g. /en/dashboard -> locale=en, pathname=/dashboard
  const pathname = request.nextUrl.pathname;
  const locale = routing.locales.find(l => pathname.startsWith(`/${l}`)) || routing.defaultLocale;
  
  // Clean pathname without locale for checking protected routes
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/(${routing.locales.join('|')})`), '') || '/';

  // Protected routes
  if (!user && (
    pathnameWithoutLocale.startsWith('/dashboard') ||
    pathnameWithoutLocale.startsWith('/workouts') ||
    pathnameWithoutLocale.startsWith('/progress') ||
    pathnameWithoutLocale.startsWith('/profile')
  )) {
    // Redirect to login with locale
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  // Auth routes (redirect to dashboard if already logged in)
  if (user && (
    pathnameWithoutLocale.startsWith('/login') ||
    pathnameWithoutLocale.startsWith('/register') ||
    pathnameWithoutLocale === '/'
  )) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}