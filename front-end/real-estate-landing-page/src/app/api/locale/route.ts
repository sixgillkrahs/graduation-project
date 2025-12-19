import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { locale } = await req.json();

  const res = NextResponse.json({ success: true });

  res.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
