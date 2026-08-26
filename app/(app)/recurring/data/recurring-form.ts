import { isIsoDateLike } from "@/lib/iso-date";

/** Raw dialog state — everything is a string until it has been validated. */
export interface RecurringFormValues {
  name: string;
  categoryId: string;
  frequencyId: string;
  /** As typed. `""` while the field is empty. */
  amount: string;
  /** `YYYY-MM-DD` from `<input type="date">`. */
  startDate: string;
  /** `""` when the template runs indefinitely. */
  endDate: string;
}

export interface RecurringFormError {
  field: keyof RecurringFormValues;
  message: string;
}

/** Matches the API's `[Range(0.01, …)]` — anything smaller comes back a 400. */
export const MIN_AMOUNT = 0.01;

/** Matches the API's `[MaxLength(250)]` on `Name`. */
export const MAX_NAME_LENGTH = 250;

/** Matches the API's `[MaxLength(500)]` on `Description`. */
export const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Checks a template the way the API would, before spending a request on it.
 *
 * Returns the first problem found, with the field that caused it, so the dialog
 * can say something specific instead of relaying "The request was rejected as
 * invalid." — which is all the BFF is willing to forward from a 400.
 */
export function validateRecurringForm(
  values: RecurringFormValues,
): RecurringFormError | null {
  const name = values.name.trim();

  if (!name) {
    return { field: "name", message: "Name is required." };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      field: "name",
      message: `Name must be ${MAX_NAME_LENGTH} characters or fewer.`,
    };
  }

  if (!values.categoryId.trim()) {
    return { field: "categoryId", message: "Please select a category." };
  }

  if (!values.frequencyId.trim()) {
    return {
      field: "frequencyId",
      message: "Please select how often it repeats.",
    };
  }

  const amount = Number(values.amount);

  if (values.amount.trim() === "" || !Number.isFinite(amount)) {
    return { field: "amount", message: "Amount is required." };
  }

  if (amount < MIN_AMOUNT) {
    return {
      field: "amount",
      message: `Amount must be at least ${MIN_AMOUNT.toFixed(2)}.`,
    };
  }

  if (!isIsoDateLike(values.startDate)) {
    return { field: "startDate", message: "Start date is invalid." };
  }

  if (values.endDate.trim() !== "") {
    if (!isIsoDateLike(values.endDate)) {
      return { field: "endDate", message: "End date is invalid." };
    }

    if (
      new Date(values.endDate).getTime() < new Date(values.startDate).getTime()
    ) {
      return {
        field: "endDate",
        message: "End date cannot be earlier than the start date.",
      };
    }
  }

  return null;
}
