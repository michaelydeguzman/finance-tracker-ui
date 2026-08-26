import { confirmPasswordReset } from "@/lib/server/api-session";
import { requireJsonContentType, routeError } from "@/lib/server/backend";

/** Public — the reset token is the credential, so no session is required or expected. */
export async function POST(request: Request) {
  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const body = (await request.json()) as {
      token?: string;
      newPassword?: string;
    };

    const token = body?.token?.trim() ?? "";
    const newPassword = body?.newPassword ?? "";

    if (!token) {
      return Response.json(
        { error: "That reset link is not valid." },
        { status: 400 },
      );
    }

    if (newPassword.length < 12) {
      return Response.json(
        { error: "Password must be at least 12 characters." },
        { status: 400 },
      );
    }

    const succeeded = await confirmPasswordReset(token, newPassword);

    return succeeded
      ? Response.json({ message: "Your password has been changed." })
      : Response.json(
          { error: "That reset link has expired or has already been used." },
          { status: 400 },
        );
  } catch (reason) {
    return routeError("POST /api/account/reset-password", reason);
  }
}
