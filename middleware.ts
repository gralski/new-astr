import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import { Database } from './types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Only run auth middleware on protected routes
  const protectedRoutes = ['/overview', '/login', '/api/']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  if (isProtectedRoute) {
    const supabase = createMiddlewareClient<Database>({ req, res })
    await supabase.auth.getSession()
  }
  
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}