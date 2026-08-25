import { DISPLAY_CURRENCY } from "@/constants";

/**
 * Groups and pads the number only — the symbol and ISO code are added below.
 *
 * Deliberately not `style: "currency"`, which renders CAD as `CA$2,993.22`
 * (or `$2,993.22` with no code, depending on locale) rather than the
 * `$2,993.22 CAD` this app displays everywhere.
 */
const amountFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * The single money formatter for the whole app: `$2,993.22 CAD`.
 *
 * Cents are always shown — dashboard tiles, chart axes and tooltips, summary
 * stats, and transaction rows all read the same way, so the same figure never
 * appears in two shapes on two pages.
 *
 * A negative figure (savings in a month that overspent) keeps the sign outside
 * the symbol — `-$1,204.50 CAD`, not `$-1,204.50 CAD`.
 *
 * Non-finite input (a NaN average over an empty range, say) formats as
 * `$0.00 CAD` rather than leaking `NaN` into the UI.
 */
export const formatCurrency = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe < 0 ? "-" : "";

  return `${sign}$${amountFormatter.format(Math.abs(safe))} ${DISPLAY_CURRENCY}`;
};

export { DISPLAY_CURRENCY };
