import { useMemo, useState } from "react";

export function useSortableData<T>(items: T[], getValue: (item: T) => string) {
  const [sort, setSort] = useState<"asc" | "desc" | null>(null);

  const toggleSort = () => {
    setSort((prev) => {
      if (prev === "asc") return "desc";
      if (prev === "desc") return null; // optional: reset to no sort
      return "asc";
    });
  };

  const sortedData = useMemo(() => {
    if (!items) return [];

    const data = [...items];

    if (sort === "asc") {
      return data.sort((a, b) => getValue(a).localeCompare(getValue(b)));
    } else if (sort === "desc") {
      return data.sort((a, b) => getValue(b).localeCompare(getValue(a)));
    }

    return data;
  }, [items, sort, getValue]);

  return { sortedData, sort, toggleSort };
}
