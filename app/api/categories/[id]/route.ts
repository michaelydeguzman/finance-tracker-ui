import type { UpsertCategoryRequest } from "@/app/(app)/categories/types/category.api";
import { callBackend, defineRoute, requireUuid } from "@/lib/server/backend";
import { isCategoryType } from "@/lib/category-type";
import { categoryConflictMessage } from "../common/utils";

type Params = { id: string };

export const PUT = defineRoute<Params>(
  { json: true },
  async ({ request, caller, params }) => {
    const invalidId = requireUuid(params.id, "category");
    if (invalidId) return invalidId;

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
      `/v1/categories/${encodeURIComponent(params.id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, categoryType }),
      },
      caller,
    );

    if (result.ok) return Response.json(result.data, { status: 200 });

    // The owner already has a category of this type with this name.
    if (result.response.status === 409) {
      return Response.json(
        { error: categoryConflictMessage("save") },
        { status: 409 },
      );
    }

    return result.response;
  },
);

export const DELETE = defineRoute<Params>({}, async ({ caller, params }) => {
  const invalidId = requireUuid(params.id, "category");
  if (invalidId) return invalidId;

  const result = await callBackend(
    `/v1/categories/${encodeURIComponent(params.id)}`,
    { method: "DELETE" },
    caller,
  );

  if (result.ok) {
    return Response.json({ message: "Category deleted successfully." });
  }

  // Transactions or recurring templates are still filed under it. Deleting it
  // would once have taken them with it; now the backend refuses.
  if (result.response.status === 409) {
    return Response.json(
      { error: categoryConflictMessage("delete") },
      { status: 409 },
    );
  }

  return result.response;
});
