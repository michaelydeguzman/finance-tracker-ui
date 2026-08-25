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

export { DISPLAY_CURRENCY };
