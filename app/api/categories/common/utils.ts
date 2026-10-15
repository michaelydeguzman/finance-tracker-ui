export type CategoryConflictSource = "delete" | "save";

/**
 * What to tell the browser when the backend says 409 about a category.
 *
 * Written here rather than forwarded, like `recurringConflictMessage`: the
 * backend's message is logged and dropped with every other backend body. That
 * costs the counts it carries ("used by 12 transactions"), but the status code
 * plus the operation is enough to say what to do next.
 */
export function categoryConflictMessage(
  source: CategoryConflictSource,
): string {
  switch (source) {
    case "delete":
      return "This category is still in use. Move its transactions and recurring transactions to another category, then delete it.";
    case "save":
      return "A category with that name already exists.";
  }
}
