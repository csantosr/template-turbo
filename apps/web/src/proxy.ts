import { type NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/settings", "/users", "/activity", "/chat"];

export async function proxy(request: NextRequest) {
  const isProtected = PROTECTED.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const res = await fetch(new URL("/api/auth/get-session", request.nextUrl.origin), {
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });

  const session = await res.json();

  if (!session?.session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
