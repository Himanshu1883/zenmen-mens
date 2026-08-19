import { applyNoStoreHeaders } from "@/lib/no-store";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isCheckoutPath(pathname: string) {
  return pathname === "/checkout" || pathname.startsWith("/checkout/");
}

function hasSessionCookie(request: NextRequest) {
  return (
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const admin = isAdminPath(pathname);
  const checkout = isCheckoutPath(pathname);

  if (!admin && !checkout) {
    return NextResponse.next();
  }

  if (admin) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const role = typeof token?.role === "string" ? token.role : "";

    if (token) {
      if (role !== "admin") {
        const home = request.nextUrl.clone();
        home.pathname = "/";
        home.search = "";
        return applyNoStoreHeaders(NextResponse.redirect(home));
      }
    } else if (!hasSessionCookie(request)) {
      const home = request.nextUrl.clone();
      home.pathname = "/";
      home.search = "";
      return applyNoStoreHeaders(NextResponse.redirect(home));
    }

    return applyNoStoreHeaders(NextResponse.next());
  }

  return applyNoStoreHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/checkout", "/checkout/:path*"],
};
