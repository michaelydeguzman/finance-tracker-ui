import { requestMagicLink } from "@/lib/server/api-session";
import { requireJsonContentType, routeError } from "@/lib/server/backend";

/** Public. Answers identically whether or not the address has an account. */
export async function POST(request: Request) {
  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const body = (await request.json()) as { email?: string };
    const email = body?.email?.trim() ?? "";

    if (email.includes("@")) {
      await requestMagicLink(email);
    }

    return Response.json({
      message: "If that email address has an account, we have sent it a link.",
    });
  } catch (reason) {
    return routeError("POST /api/account/magic-link", reason);
  }
}
