import type { UpsertCategoryRequest } from "@/app/(app)/categories/types/category.api";
import {
  callBackend,
  requireJsonContentType,
  requireSession,
  routeError,
} from "@/lib/server/backend";
import { isCategoryType, parseCategoryType } from "@/lib/category-type";

export async function GET(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const rawCategoryType = searchParams.get("categoryType");
    const categoryType = parseCategoryType(rawCategoryType);

    if (rawCategoryType !== null && categoryType === undefined) {
      return Response.json(
        { error: "Category type must be income or expense." },
        { status: 400 },
      );
    }

    const query = new URLSearchParams();
    if (categoryType !== undefined) {
      query.set("categoryType", String(categoryType));
    }

    const qs = query.toString();
    const result = await callBackend(
      qs ? `/v1/categories?${qs}` : "/v1/categories",
    );

    return result.ok ? Response.json(result.data) : result.response;
  } catch (reason) {
    return routeError("GET /api/categories", reason);
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
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

    const result = await callBackend("/v1/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, categoryType }),
    });

    return result.ok
      ? Response.json(result.data, { status: 201 })
      : result.response;
  } catch (reason) {
    return routeError("POST /api/categories", reason);
  }
}
