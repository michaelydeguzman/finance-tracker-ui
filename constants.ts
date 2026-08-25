/** App-wide constants. Keep display/formatting defaults here, not per feature. */

export const APP_NAME = "Finance Tracker";

/**
 * Household label shown under page titles.
 * Households are not yet persisted server-side — see `app/(app)/households`.
 */
export const DEFAULT_HOUSEHOLD_NAME = "De Guzman Household";

/**
 * Single source of truth for money formatting.
 *
 * Previously the dashboard formatted as USD while the income/expense lists
 * formatted as CAD, so the same transaction rendered differently per page.
 */
export const DISPLAY_CURRENCY = "CAD";

/**
 * Stamped into `createdBy` on rows this app writes. It identifies the client,
 * not a person, so it is never surfaced as an author in the UI.
 */
export const APP_CREATED_BY = "finance-tracker-ui";
