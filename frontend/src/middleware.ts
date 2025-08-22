import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  // If user is authenticated and trying to access root page, redirect to dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If user is authenticated and trying to access register page, redirect to dashboard
  if (token && pathname === "/register") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If user is not authenticated and trying to access protected routes, redirect to root
  if (!token && (pathname.startsWith("/dashboard") || pathname.startsWith("/tasks"))) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
