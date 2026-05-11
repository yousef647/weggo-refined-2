import { auth } from "@/auth.edge";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  if (!session?.user) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (session.user.banned) {
    return NextResponse.redirect(new URL("/banned", req.nextUrl.origin));
  }

  if (pathname.startsWith("/admin") && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (
    pathname.startsWith("/sell") &&
    session.user.role !== "seller" &&
    session.user.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/account/become-seller", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/sell",
    "/sell/:path*",
    "/messages",
    "/messages/:path*",
    "/wishlist",
    "/wishlist/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
