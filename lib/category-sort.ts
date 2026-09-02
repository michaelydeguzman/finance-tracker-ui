/**
 * Orders named records alphabetically for display.
 *
 * The categories endpoint returns rows in insertion order, which is arbitrary
 * from the user's point of view, so every picker has to sort them itself.
 *
 * Comparison is locale-aware and case-insensitive (`sensitivity: "base"`, which
 * also folds accents, so "Éducation" files next to "Education" rather than after
 * "Zoo"), and `numeric` keeps "Trip 2" ahead of "Trip 10". Names that compare
 * equal keep their incoming order — `Array.prototype.sort` is stable — so the
 * result is deterministic rather than shuffling duplicates between renders.
 *
 * Returns a new array; the caller's list is never mutated.
 */
export function sortByName<T extends { name: string }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
      numeric: true,
    }),
  );
}
