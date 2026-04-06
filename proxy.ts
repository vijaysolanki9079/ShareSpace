import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const proxy = withAuth(
  function middleware(req) {
    // Allow access to protected routes only if authenticated
    if (req.nextauth.token) {
      return NextResponse.next();
    }

    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", req.url));
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ngo-dashboard/:path*",
  ],
};
