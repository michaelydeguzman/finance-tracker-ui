import { describe, expect, it } from "vitest";
import { categoryConflictMessage } from "@/app/api/categories/common/utils";
import { errorMessage } from "@/lib/utils";

describe("categoryConflictMessage", () => {
  it("tells someone refused a delete to move the category's records first", () => {
    expect(categoryConflictMessage("delete")).toMatch(/still in use/i);
    expect(categoryConflictMessage("delete")).toMatch(/move/i);
  });

  it("names a duplicate as the reason a save was refused", () => {
    expect(categoryConflictMessage("save")).toMatch(/already exists/i);
  });
});

describe("errorMessage", () => {
  it("surfaces the message a failed request was thrown with", () => {
    expect(errorMessage(new Error("This category is still in use."), "x")).toBe(
      "This category is still in use.",
    );
  });

  it("falls back when there is no message to show", () => {
    expect(errorMessage(new Error(""), "Failed.")).toBe("Failed.");
    expect(errorMessage("not an error", "Failed.")).toBe("Failed.");
  });
});
