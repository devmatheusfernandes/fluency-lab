import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    
    // If user is authenticated and trying to access auth pages, redirect to hub
    if (token && (req.nextUrl.pathname.startsWith('/signin') || 
        req.nextUrl.pathname.startsWith('/signup'))) {
      return NextResponse.redirect(new URL('/hub', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages for unauthenticated users
        if (req.nextUrl.pathname.startsWith('/signin') || 
            req.nextUrl.pathname.startsWith('/signup')) {
          return true;
        }
        
        // Protect hub routes - require authentication
        if (req.nextUrl.pathname.startsWith('/hub')) {
          return !!token;
        }
        
        // Allow all other routes
        return true;
      }
    }
  }
);

export const config = {
  matcher: [
    '/signin',
    '/signup',
    '/hub/:path*',
  ],
};