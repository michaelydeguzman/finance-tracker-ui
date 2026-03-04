"use client";

import { useOptimistic, useState, useTransition } from "react";

export interface OptimisticState<T> {
  data: T[];
  pending: boolean;
}

type OptimisticAction<T extends { id: string | number }> =
  | { type: "add"; payload: T }
  | { type: "update"; payload: { id: T["id"]; updates: Partial<T> } }
  | { type: "delete"; payload: { id: T["id"] } };

export function useOptimisticList<T extends { id: string | number }>(
  initialData: T[],
  addFn: (item: Omit<T, "id">) => Promise<T>,
  updateFn: (id: T["id"], updates: Partial<T>) => Promise<T>,
  deleteFn: (id: T["id"]) => Promise<void>,
) {
  const [items, setItems] = useState<T[]>(() => initialData);
  const [isPending, startTransition] = useTransition();

  const [optimisticData, addOptimistic] = useOptimistic(
    items,
    (state: T[], action: OptimisticAction<T>) => {
      switch (action.type) {
        case "add":
          return [...state, action.payload];
        case "update":
          return state.map((item) =>
            item.id === action.payload.id
              ? { ...item, ...action.payload.updates }
              : item,
          );
        case "delete":
          return state.filter((item) => item.id !== action.payload.id);
        default:
          return state;
      }
    },
  );

  const addItem = (item: Omit<T, "id">) => {
    const tempId = `temp-${crypto.randomUUID?.() ?? Date.now()}` as T["id"];

    startTransition(async () => {
      addOptimistic({
        type: "add",
        payload: { ...item, id: tempId } as T,
      });

      try {
        const savedItem = await addFn(item);
        setItems((prev) => [...prev, savedItem]);
      } catch (error) {
        console.error("Failed to add item:", error);
        setItems((prev) => [...prev]);
      }
    });
  };

  const updateItem = (id: T["id"], updates: Partial<T>) => {
    startTransition(async () => {
      addOptimistic({ type: "update", payload: { id, updates } });
      try {
        const updated = await updateFn(id, updates);
        setItems((prev) =>
          prev.map((item) => (item.id === id ? updated : item)),
        );
      } catch (error) {
        console.error("Failed to update item:", error);
        setItems((prev) => [...prev]);
      }
    });
  };

  const deleteItem = (id: T["id"]) => {
    startTransition(async () => {
      addOptimistic({ type: "delete", payload: { id } });
      try {
        await deleteFn(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Failed to delete item:", error);
        setItems((prev) => [...prev]);
      }
    });
  };

  return {
    data: optimisticData,
    pending: isPending,
    setData: setItems,
    addItem,
    updateItem,
    deleteItem,
  };
}
