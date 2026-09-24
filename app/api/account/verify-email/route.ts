import { verifyEmail } from "@/lib/server/api-session";
import { requireJsonContentType, routeError } from "@/lib/server/backend";

/**
 * Public — the confirmation token and the password chosen at sign-up are the credential
 * together. The token alone proves control of the inbox, not that the clicker chose this
 * account's password, so the API will not confirm on the token alone.
 */
export async function POST(request: Request) {
  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
    };
    const token = body?.token?.trim() ?? "";
    const password = body?.password ?? "";

    if (!token) {
      return Response.json(
        { error: "That confirmation link is not valid." },
        { status: 400 },
      );
    }

    if (!password) {
      return Response.json(
        { error: "Enter the password you chose when you signed up." },
        { status: 400 },
      );
    }

    const succeeded = await verifyEmail(token, password);

    // One message for a wrong password and a dead link alike: the API does not say which,
    // and this route has nothing to add.
    return succeeded
      ? Response.json({ message: "Your email address is confirmed." })
      : Response.json(
          {
            error:
              "That did not work. Check the password you chose when you signed up, or request a new link if this one has expired.",
          },
          { status: 400 },
        );
  } catch (reason) {
    return routeError("POST /api/account/verify-email", reason);
  }
}
