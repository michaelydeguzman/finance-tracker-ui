import type { UpsertCategoryRequest } from "@/app/(app)/categories/types/category.api";
import {
  callBackend,
  isUuid,
  requireJsonContentType,
  requireSession,
  routeError,
} from "@/lib/server/backend";
import { isCategoryType } from "@/lib/category-type";

// A factory, not a shared instance: a Response body can only be consumed once.
const invalidId = () =>
  Response.json({ error: "A valid category id is required." }, { status: 400 });

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(request);
  if (!session.ok) return session.response;

  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const { id } = await context.params;

    if (!isUuid(id)) {
      return invalidId();
    }

    const body = (await request.json()) as Partial<UpsertCategoryRequest>;
    const name = body?.name?.trim();
    const categoryType = body?.categoryType;

    if (!name) {
      return Response.json({ error: "Name is required." }, { status: 400 });
    }

    if (!isCategoryType(categoryType)) {
      return Response.json(
        { error: "Category type must be income or expense." },
        { status: 400 },
      );
    }

    const result = await callBackend(
      `/v1/categories/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, categoryType }),
      },
      session.caller,
    );

    return result.ok
      ? Response.json(result.data, { status: 200 })
      : result.response;
  } catch (reason) {
    return routeError("PUT /api/categories/[id]", reason);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(request);
  if (!session.ok) return session.response;

  try {
    const { id } = await context.params;

    if (!isUuid(id)) {
      return invalidId();
    }

    const result = await callBackend(
      `/v1/categories/${encodeURIComponent(id)}`,
      { method: "DELETE" },
      session.caller,
    );

    return result.ok
      ? Response.json({ message: "Category deleted successfully." })
      : result.response;
  } catch (reason) {
    return routeError("DELETE /api/categories/[id]", reason);
  }
}
