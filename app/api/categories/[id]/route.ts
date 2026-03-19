import type { UpsertCategoryRequest } from "@/app/categories/types/category.api";
import { isValidCategoryType } from "../common/utils";

const API_URL = process.env.API_URL;

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return Response.json({ error: "Id is required." }, { status: 400 });
    }

    const body = (await request.json()) as Partial<UpsertCategoryRequest>;
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

    const response = await fetch(`${API_URL}/v1/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, categoryType }),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: text || "Backend request failed." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data, { status: 200 });
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return Response.json({ error: "Id is required." }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/v1/categories/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: text || "Backend request failed." },
        { status: response.status },
      );
    }

    return Response.json(
      { message: "Category deleted successfully." },
      { status: 200 },
    );
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
