import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { UserRole } from "@/generated/prisma/client"

const ROLE_ROUTES: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["/"],
  CAPTAIN: [
    "/dashboard",
    "/residents",
    "/households",
    "/documents",
    "/blotter",
    "/officials",
    "/budget",
    "/projects",
    "/health",
    "/disaster",
    "/map",
    "/reports",
    "/settings/officials",
    "/settings/puroks",
  ],
  SECRETARY: [
    "/dashboard",
    "/residents",
    "/households",
    "/documents",
    "/blotter",
    "/officials",
    "/budget",
    "/projects",
    "/health",
    "/disaster",
    "/map",
    "/reports",
    "/settings/puroks",
  ],
  TREASURER: ["/dashboard", "/budget", "/map", "/reports"],
  KAGAWAD: ["/dashboard", "/residents", "/blotter", "/map"],
  SK_CHAIRMAN: ["/dashboard", "/residents", "/health", "/map"],
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const role = token.role as UserRole

    if (role === "SUPER_ADMIN") {
      return NextResponse.next()
    }

    const allowedRoutes = ROLE_ROUTES[role] || []
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route))

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/residents/:path*",
    "/households/:path*",
    "/documents/:path*",
    "/blotter/:path*",
    "/officials/:path*",
    "/budget/:path*",
    "/projects/:path*",
    "/health/:path*",
    "/disaster/:path*",
    "/map/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
}
