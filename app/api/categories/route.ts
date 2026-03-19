import { CategoryType } from "@/types/shared/enums";
import type { UpsertCategoryRequest } from "@/app/categories/types/category.api";
import { isValidCategoryType } from "./common/utils";

const API_URL = process.env.API_URL;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const backendUrl =
      type !== null
        ? `${API_URL}/v1/categories?type=${type}`
        : `${API_URL}/v1/categories`;

    console.log("[GET /api/categories] backendUrl:", backendUrl);
    const response = await fetch(backendUrl);

    if (!response.ok) {
      const text = await response.text();
      console.error(
        "[GET /api/categories] Backend error:",
        response.status,
        text,
      );
      return Response.json(
        { error: text || "Backend request failed." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (reason) {
    console.error("[GET /api/categories] Exception:", reason);
    const message =
      reason instanceof Error ? reason.message : "Unexpected server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  try {
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

    const response = await fetch(`${API_URL}/v1/categories`, {
      method: "POST",
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
    return Response.json(data, { status: 201 });
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
