import { verifyEmail } from "@/lib/server/api-session";
import { requireJsonContentType, routeError } from "@/lib/server/backend";

/** Public — the confirmation token is the credential. */
export async function POST(request: Request) {
  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const body = (await request.json()) as { token?: string };
    const token = body?.token?.trim() ?? "";

    if (!token) {
      return Response.json(
        { error: "That confirmation link is not valid." },
        { status: 400 },
      );
    }

    const succeeded = await verifyEmail(token);

    return succeeded
      ? Response.json({ message: "Your email address is confirmed." })
      : Response.json(
          {
            error:
              "That confirmation link has expired or has already been used.",
          },
          { status: 400 },
        );
  } catch (reason) {
    return routeError("POST /api/account/verify-email", reason);
  }
}
