import { NextResponse } from "next/server";

type LoginBody = { email?: unknown; password?: unknown };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (body === null || typeof body !== "object") {
    return NextResponse.json(
      { success: false, message: "email and password are required." },
      { status: 400 },
    );
  }

  const { email, password } = body as LoginBody;
  const emailStr = typeof email === "string" ? email.trim() : "";
  const passwordStr = typeof password === "string" ? password : "";

  if (!emailStr || !passwordStr) {
    return NextResponse.json(
      { success: false, message: "email and password are required." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { success: false, message: "Authentication API is not configured." },
    { status: 501 },
  );
}
