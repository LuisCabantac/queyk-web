import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  if (url.pathname === "/api/auth/error") {
    const error = url.searchParams.get("error") || "AccessDenied";
    return NextResponse.redirect(new URL(`/error?error=${error}`, request.url));
  }

  if (url.pathname === "/api/auth/signin" && url.searchParams.has("error")) {
    const error = url.searchParams.get("error");
    return NextResponse.redirect(new URL(`/error?error=${error}`, request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/api/auth/error", "/((?!public|_next|api).*)"],
};
