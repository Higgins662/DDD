import { NextResponse } from "next/server";
import { checkAdminPassword, passwordFromAuthHeader } from "./lib/admin";

// Ask for a password (HTTP Basic Auth) before showing anything under /admin.
// The browser shows its own sign-in box; any username works.
export async function middleware(request) {
  const password = passwordFromAuthHeader(request.headers.get("authorization"));
  if (await checkAdminPassword(password)) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }
  return new NextResponse("Password required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="DropDadDeals admin", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
