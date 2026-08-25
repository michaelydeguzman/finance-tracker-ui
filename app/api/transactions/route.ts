import type { UpsertTransactionRequest } from "@/app/transactions/types/transaction.api";
import {
  callBackend,
  isUuid,
  requireJsonContentType,
  requireSession,
  routeError,
} from "@/lib/server/backend";
import { parseCategoryType } from "@/lib/category-type";
import {
  MAX_PAGE_SIZE,
  buildBackendTransactionListSearchParams,
  buildNormalizedTransactionUpsertBody,
  isValidTransactionDate,
  parsePositiveIntParam,
  validateTransactionBody,
} from "./common/utils";

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

      if (new Date(fromTrim).getTime() > new Date(toTrim).getTime()) {
        return Response.json(
          { error: "from must not be after to." },
          { status: 400 },
        );
      }

      from = fromTrim;
      to = toTrim;
    }

    const categoryIds = searchParams
      .getAll("categoryIds")
      .map((value) => value.trim())
      .filter((value) => value !== "");

    for (const id of categoryIds) {
      if (!isUuid(id)) {
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
      if (pageParsed instanceof Response) return pageParsed;

      const pageSizeParsed = parsePositiveIntParam(
        pageSizeRaw,
        "pageSize",
        MAX_PAGE_SIZE,
      );
      if (pageSizeParsed instanceof Response) return pageSizeParsed;

      page = pageParsed;
      pageSize = pageSizeParsed;
    }

    const qs = buildBackendTransactionListSearchParams({
      categoryType,
      from,
      to,
      categoryIds,
      page,
      pageSize,
    }).toString();

    const result = await callBackend(
      qs ? `/v1/transactions?${qs}` : "/v1/transactions",
    );

    return result.ok ? Response.json(result.data) : result.response;
  } catch (reason) {
    return routeError("GET /api/transactions", reason);
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const wrongContentType = requireJsonContentType(request);
  if (wrongContentType) return wrongContentType;

  try {
    const body = (await request.json()) as Partial<UpsertTransactionRequest>;

    const invalid = validateTransactionBody(body);
    if (invalid) return invalid;

    const result = await callBackend("/v1/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildNormalizedTransactionUpsertBody(body)),
    });

    return result.ok
      ? Response.json(result.data, { status: 201 })
      : result.response;
  } catch (reason) {
    return routeError("POST /api/transactions", reason);
  }
}
