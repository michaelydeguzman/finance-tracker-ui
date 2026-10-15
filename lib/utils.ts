import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The message a failed request was thrown with, or `fallback` when there is none. */
export const errorMessage = (reason: unknown, fallback: string): string =>
  reason instanceof Error && reason.message ? reason.message : fallback;
