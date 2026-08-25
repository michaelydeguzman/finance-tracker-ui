"use client";

import { useCallback, useMemo, useState } from "react";

export type SortDirection = "asc" | "desc" | null;

/**
 * Alphabetical sorting with an asc → desc → unsorted cycle.
 *
 * `getValue` is a memo dependency, so pass a stable reference (a module-level
 * function or `useCallback`) rather than an inline arrow.
 */
export function useSortableData<T>(items: T[], getValue: (item: T) => string) {
  const [sort, setSort] = useState<SortDirection>(null);

  const toggleSort = useCallback(() => {
    setSort((previous) => {
      if (previous === "asc") return "desc";
      if (previous === "desc") return null;
      return "asc";
    });
  }, []);

  const sortedData = useMemo(() => {
    const data = [...(items ?? [])];

    if (sort === null) {
      return data;
    }

    const direction = sort === "asc" ? 1 : -1;

    return data.sort(
      (a, b) => direction * getValue(a).localeCompare(getValue(b)),
    );
  }, [items, sort, getValue]);

  return { sortedData, sort, toggleSort };
}
