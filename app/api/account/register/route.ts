import { requestRegistration } from "@/lib/server/api-session";
import { requireJsonContentType, routeError } from "@/lib/server/backend";

/**
 * Public on purpose — someone registering has no session yet.
 *
 * Always answers the same way. The API does not reveal whether an address is already taken
 * (it emails the real owner instead), and echoing anything more specific here would undo
 * that.
 */
export async function POST(request: Request) {
  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      displayName?: string;
    };

    const email = body?.email?.trim() ?? "";
    const password = body?.password ?? "";
    const displayName = body?.displayName?.trim();

    if (!email.includes("@")) {
      return Response.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (password.length < 12) {
      return Response.json(
        { error: "Password must be at least 12 characters." },
        { status: 400 },
      );
    }

    await requestRegistration({
      email,
      password,
      ...(displayName ? { displayName } : {}),
    });

    return Response.json({
      message: "Check your email to confirm your address.",
    });
  } catch (reason) {
    return routeError("POST /api/account/register", reason);
  }
}
