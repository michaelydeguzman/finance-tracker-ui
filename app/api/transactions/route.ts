import type { UpsertTransactionRequest } from "@/app/transactions/types/transaction.api";
import {
  buildBackendTransactionListSearchParams,
  buildNormalizedTransactionUpsertBody,
  isUuidString,
  isValidCategoryTypeValue,
  isValidTransactionDate,
  parsePositiveIntParam,
} from "./common/utils";

const API_URL = process.env.API_URL;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryTypeRaw = searchParams.get("categoryType");

    if (
      categoryTypeRaw !== null &&
      !isValidCategoryTypeValue(Number(categoryTypeRaw))
    ) {
      return Response.json(
        { error: "Category type must be income or expense." },
        { status: 400 },
      );
    }

    const categoryTypeNum =
      categoryTypeRaw !== null ? Number(categoryTypeRaw) : null;

    const fromRaw = searchParams.get("from");
    const toRaw = searchParams.get("to");
    if ((fromRaw !== null) !== (toRaw !== null)) {
      return Response.json(
        { error: "from and to must both be provided." },
        { status: 400 },
      );
    }

    let from: string | null = null;
    let to: string | null = null;
    if (fromRaw !== null && toRaw !== null) {
      const fromTrim = fromRaw.trim();
      const toTrim = toRaw.trim();
      if (
        !isValidTransactionDate(fromTrim) ||
        !isValidTransactionDate(toTrim)
      ) {
        return Response.json(
          { error: "from and to must be valid date strings." },
          { status: 400 },
        );
      }
      from = fromTrim;
      to = toTrim;
    }

    const categoryIdRaw = searchParams
      .getAll("categoryIds")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    for (const id of categoryIdRaw) {
      if (!isUuidString(id)) {
        return Response.json(
          { error: "Invalid categoryIds value." },
          { status: 400 },
        );
      }
    }

    const pageRaw = searchParams.get("page");
    const pageSizeRaw = searchParams.get("pageSize");
    if ((pageRaw !== null) !== (pageSizeRaw !== null)) {
      return Response.json(
        { error: "page and pageSize must both be provided." },
        { status: 400 },
      );
    }

    let page: number | null = null;
    let pageSize: number | null = null;
    if (pageRaw !== null && pageSizeRaw !== null) {
      const pageParsed = parsePositiveIntParam(pageRaw, "page");
      if (pageParsed instanceof Response) {
        return pageParsed;
      }
      const pageSizeParsed = parsePositiveIntParam(pageSizeRaw, "pageSize");
      if (pageSizeParsed instanceof Response) {
        return pageSizeParsed;
      }
      page = pageParsed;
      pageSize = pageSizeParsed;
    }

    const backendParams = buildBackendTransactionListSearchParams({
      categoryType: categoryTypeNum,
      from,
      to,
      categoryIds: categoryIdRaw,
      page,
      pageSize,
    });

    const qs = backendParams.toString();
    const backendUrl = qs
      ? `${API_URL}/v1/transactions?${qs}`
      : `${API_URL}/v1/transactions`;

    const response = await fetch(backendUrl);

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: text || "Backend request failed." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (reason) {
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
    const body = (await request.json()) as Partial<UpsertTransactionRequest>;

    if (!body?.name?.trim()) {
      return Response.json({ error: "Name is required." }, { status: 400 });
    }

    if (!body?.categoryId?.trim()) {
      return Response.json(
        { error: "Category id is required." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(body?.amount) || Number(body.amount) <= 0) {
      return Response.json(
        { error: "Amount must be greater than zero." },
        { status: 400 },
      );
    }

    if (!isValidTransactionDate(body?.transactionDate)) {
      return Response.json(
        { error: "Transaction date is invalid." },
        { status: 400 },
      );
    }

    if (!body?.createdBy?.trim()) {
      return Response.json(
        { error: "Created by is required." },
        { status: 400 },
      );
    }

    const normalized = buildNormalizedTransactionUpsertBody(body);

    const response = await fetch(`${API_URL}/v1/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
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
