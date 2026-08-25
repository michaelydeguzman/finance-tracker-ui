import { DISPLAY_CURRENCY } from "@/constants";

/**
 * Shared money formatter. `maximumFractionDigits: 0` matches the existing
 * dashboard/list presentation — whole-dollar figures.
 */
const formatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: DISPLAY_CURRENCY,
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number): string =>
  formatter.format(Number.isFinite(value) ? value : 0);

/**
 * Transaction-row money: exact cents, symbol leading, ISO code trailing —
 * e.g. `$2,993.22 CAD`.
 *
 * Deliberately not `style: "currency"`, which renders CAD as `CA$2,993.22`
 * with no trailing code. Rows show the code because income and expenses are
 * no longer distinguished by colour.
 */
const amountFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatTransactionAmount = (value: number): string =>
  `$${amountFormatter.format(Number.isFinite(value) ? value : 0)} ${DISPLAY_CURRENCY}`;

export { DISPLAY_CURRENCY };
