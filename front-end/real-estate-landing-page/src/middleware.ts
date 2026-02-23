import { type NextRequest, NextResponse } from "next/server";

const defaultLocale = "en";
const supportedLocales = ["en", "vi"];

export function middleware(request: NextRequest) {
  const localeCookie = request.cookies.get("locale");

  // If cookie exists and is valid, proceed
  if (localeCookie?.value && supportedLocales.includes(localeCookie.value)) {
    return NextResponse.next();
  }

  // Parse Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  const languages = acceptLanguage
    .split(",")
    .map((l) => l.split(";")[0].trim().substring(0, 2).toLowerCase());

  // Detect supported language, otherwise fallback to default
  let locale = defaultLocale;
  for (const lang of languages) {
    if (supportedLocales.includes(lang)) {
      locale = lang;
      break;
    }
  }

  // Set the locale cookie
  const response = NextResponse.next();
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year expiry
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .svg, .png, .jpg)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
