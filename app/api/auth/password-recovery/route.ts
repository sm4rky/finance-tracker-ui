import { NextResponse } from "next/server";

export function DELETE() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set("password-recovery", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
