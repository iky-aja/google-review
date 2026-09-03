import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard") || 
                           nextUrl.pathname.startsWith("/cards");
  const isSettingsRoute = nextUrl.pathname.startsWith("/settings");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login?callbackUrl=/admin", nextUrl));
    }
    const userRole = req.auth?.user?.role;
    if (userRole !== "admin") {
      return Response.redirect(new URL("/login?callbackUrl=/admin", nextUrl));
    }
  }

  if (isDashboardRoute || isSettingsRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login?callbackUrl=/dashboard", nextUrl));
    }
    const userRole = req.auth?.user?.role;
    if (userRole === "admin") {
      return Response.redirect(new URL("/admin", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
