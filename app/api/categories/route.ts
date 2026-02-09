import { CategoryTypes } from "@/app/categories/_types/category.model";
import type {
  CategoryApiResponse,
  CreateCategoryRequest,
} from "@/app/categories/_types/category.api";

const isValidCategoryType = (value: unknown): value is CategoryTypes =>
  Object.values(CategoryTypes).includes(value as CategoryTypes);

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  try {
    const body = (await request.json()) as Partial<CreateCategoryRequest>;
    const name = body?.name?.trim();
    const categoryType = body?.categoryType;

    if (!name) {
      return Response.json({ error: "Name is required." }, { status: 400 });
    }

    if (!isValidCategoryType(categoryType)) {
      return Response.json(
        { error: "Category type must be income or expense." },
        { status: 400 },
      );
    }

    const payload: CategoryApiResponse = {
      id: crypto.randomUUID(),
      name,
      categoryType,
      createdAt: new Date().toISOString(),
      isActive: body?.isActive ?? true,
    };

    return Response.json(payload, { status: 201 });
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected server error.";

    return Response.json({ error: message }, { status: 500 });
  }
}
