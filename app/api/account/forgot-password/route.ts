import { requestPasswordReset } from "@/lib/server/api-session";
import { requireJsonContentType, routeError } from "@/lib/server/backend";

/** Public. Answers identically whether or not the address has an account. */
export async function POST(request: Request) {
  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const body = (await request.json()) as { email?: string };
    const email = body?.email?.trim() ?? "";

    if (email.includes("@")) {
      await requestPasswordReset(email);
    }

    // Returned even for an address that is obviously malformed, so that response shape
    // cannot be used to probe which addresses exist.
    return Response.json({
      message: "If that email address has an account, we have sent it a link.",
    });
  } catch (reason) {
    return routeError("POST /api/account/forgot-password", reason);
  }
}
