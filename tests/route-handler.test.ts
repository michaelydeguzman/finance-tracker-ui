import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The preamble every session-gated `/api/**` handler runs behind.
 *
 * What is worth pinning here is the order of refusals and the fact that the
 * handler does not run at all when one of them fires: a route body that
 * executed without a session would proxy an anonymous request to the backend
 * holding real financial records.
 */

const getToken = vi.hoisted(() => vi.fn());

vi.mock("next-auth/jwt", () => ({ getToken }));

const ORIGINAL_ENV = { ...process.env };

const signedIn = () => ({ apiSession: { accessToken: "an.access.token" } });

const jsonRequest = (url: string, init?: RequestInit) =>
  new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...init,
  });

async function loadModule() {
  vi.resetModules();
  return import("@/lib/server/backend");
}

beforeEach(() => {
  process.env.AUTH_SECRET = "a-test-secret";
  process.env.API_URL = "https://api.test/api";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  getToken.mockReset();
  vi.restoreAllMocks();
});

describe("defineRoute", () => {
  it("answers 401 without running the handler when there is no session", async () => {
    getToken.mockResolvedValue(null);
    const { defineRoute } = await loadModule();
    const handler = vi.fn();

    const response = await defineRoute(
      {},
      handler,
    )(new Request("https://app.test/api/transactions"));

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("answers 415 without running the handler when a JSON route is sent the wrong type", async () => {
    getToken.mockResolvedValue(signedIn());
    const { defineRoute } = await loadModule();
    const handler = vi.fn();

    const response = await defineRoute(
      { json: true },
      handler,
    )(
      jsonRequest("https://app.test/api/transactions", {
        headers: { "Content-Type": "text/plain" },
      }),
    );

    expect(response.status).toBe(415);
    expect(handler).not.toHaveBeenCalled();
  });

  it("leaves the content type alone on a route that declares no body", async () => {
    // A GET or DELETE carries no body, so demanding application/json on one
    // would reject every well-formed request.
    getToken.mockResolvedValue(signedIn());
    const { defineRoute } = await loadModule();

    const response = await defineRoute({}, async () =>
      Response.json({ ok: 1 }),
    )(new Request("https://app.test/api/transactions", { method: "DELETE" }));

    expect(response.status).toBe(200);
  });

  it("hands the handler the bearer token and the resolved params", async () => {
    getToken.mockResolvedValue(signedIn());
    const { defineRoute } = await loadModule();

    const response = await defineRoute<{ id: string }>({}, async (args) =>
      Response.json({
        token: args.caller.accessToken,
        id: args.params.id,
      }),
    )(new Request("https://app.test/api/transactions/abc"), {
      params: Promise.resolve({ id: "abc" }),
    });

    await expect(response.json()).resolves.toEqual({
      token: "an.access.token",
      id: "abc",
    });
  });

  it("passes an empty params object to a route with no dynamic segment", async () => {
    // Next calls a static route with no second argument, and a handler reading
    // `params.id` off `undefined` would be a 500 instead of whatever it meant.
    getToken.mockResolvedValue(signedIn());
    const { defineRoute } = await loadModule();

    const response = await defineRoute({}, async ({ params }) =>
      Response.json({ keys: Object.keys(params) }),
    )(new Request("https://app.test/api/recurring-options"));

    await expect(response.json()).resolves.toEqual({ keys: [] });
  });

  it("turns an unexpected throw into an opaque 500", async () => {
    getToken.mockResolvedValue(signedIn());
    const { defineRoute } = await loadModule();

    const response = await defineRoute({}, async () => {
      throw new Error("connect ECONNREFUSED 127.0.0.1:7203");
    })(new Request("https://app.test/api/transactions"));

    expect(response.status).toBe(500);
    // The reason is logged, never returned — it names internal hosts and ports.
    await expect(response.json()).resolves.toEqual({
      error: "Unexpected server error.",
    });
  });

  it("logs the failing route as its method and path, without the query string", async () => {
    getToken.mockResolvedValue(signedIn());
    const { defineRoute } = await loadModule();
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    await defineRoute({}, async () => {
      throw new Error("boom");
    })(new Request("https://app.test/api/transactions?categoryIds=secret"));

    expect(logged.mock.calls[0]?.[0]).toBe(
      "[GET /api/transactions] Unhandled failure:",
    );
  });

  it("rejects a params promise as a 500 rather than an unhandled rejection", async () => {
    getToken.mockResolvedValue(signedIn());
    const { defineRoute } = await loadModule();

    const response = await defineRoute<{ id: string }>({}, async () =>
      Response.json({ reached: true }),
    )(new Request("https://app.test/api/transactions/abc"), {
      params: Promise.reject(new Error("params failed")),
    });

    expect(response.status).toBe(500);
  });
});

describe("requireUuid", () => {
  it("accepts a UUID", async () => {
    const { requireUuid } = await loadModule();

    expect(
      requireUuid("5f1b6c1e-0000-4000-8000-000000000001", "transaction"),
    ).toBeNull();
  });

  it("names the resource in the rejection", async () => {
    const { requireUuid } = await loadModule();

    const response = requireUuid("not-a-uuid", "recurring transaction");

    expect(response?.status).toBe(400);
    await expect(response?.json()).resolves.toEqual({
      error: "A valid recurring transaction id is required.",
    });
  });

  it("rejects a missing segment", async () => {
    const { requireUuid } = await loadModule();

    expect(requireUuid(undefined, "category")?.status).toBe(400);
  });

  it("builds a fresh response each time", async () => {
    // A shared instance would come back with an already-consumed body the
    // second time any route rejected an id.
    const { requireUuid } = await loadModule();

    const first = requireUuid("nope", "category");
    const second = requireUuid("nope", "category");

    await expect(first?.json()).resolves.toEqual({
      error: "A valid category id is required.",
    });
    await expect(second?.json()).resolves.toEqual({
      error: "A valid category id is required.",
    });
  });
});
