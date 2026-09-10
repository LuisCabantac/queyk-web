import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

const handlers = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  const response = await handlers.GET(request);

  // 3xx redirects (e.g. 302 to /dashboard) are SUCCESSFUL redirects and must proceed directly
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // Only handle actual HTTP error statuses (4xx, 5xx)
  if (response.status >= 400) {
    let errorCode = "AccessDenied";
    try {
      const cloned = response.clone();
      const data = await cloned.json();
      if (data?.message) {
        errorCode = data.message;
      }
    } catch {
      // Not JSON, continue with fallback
    }

    return NextResponse.redirect(
      new URL(`/error?error=${encodeURIComponent(errorCode)}`, request.url)
    );
  }

  return response;
}

export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
