import { NextResponse } from "next/server";
import { checkAdminPassword, passwordFromAuthHeader } from "./lib/admin";

// /admin: ask for a password (HTTP Basic Auth) before showing anything under /admin.
// The browser shows its own sign-in box; any username works.
export async function middleware(request) {
  // Old category-filter links (/?cat=a,b): the chips now filter in the
  // browser and keep the choice after a "#", so send these to /#cat=a,b.
  // This answers with a tiny redirect instead of building the whole page
  // (bots crawled millions of these combinations).
  if (request.nextUrl.pathname === "/") {
    const cat = request.nextUrl.searchParams.get("cat") || "";
    const to = new URL("/", request.url);
    if (cat) to.hash = `cat=${cat}`;
    return NextResponse.redirect(to, 308);
  }

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

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    // Only runs for the home page when the address has ?cat=...
    { source: "/", has: [{ type: "query", key: "cat" }] },
  ],
};
