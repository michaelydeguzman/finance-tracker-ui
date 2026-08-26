import { FrequencyType } from "@/types/shared/enums";
import type { FrequencyOption } from "../types/frequency.model";

/**
 * Whether a frequency can actually be saved against a template.
 *
 * `GET /recurring-options` returns every frequency row, but create and update
 * both reject two kinds: an inactive frequency, and a `Custom` one with no
 * positive interval configured. Offering either produces a save that fails for
 * a reason the user cannot see or fix, so they are filtered out of the picker.
 */
export const isSelectableFrequency = (option: FrequencyOption): boolean => {
  if (!option.isActive) return false;

  if (option.type === FrequencyType.Custom) {
    return option.intervalDays !== null && option.intervalDays > 0;
  }

  return true;
};

export const selectableFrequencies = (
  options: FrequencyOption[],
): FrequencyOption[] => options.filter(isSelectableFrequency);

/**
 * Secondary line under a frequency's name in the picker.
 *
 * A custom frequency's name says nothing about how often it fires, so its
 * interval is spelled out; everything else falls back to whatever description
 * the API carries, and to nothing at all when there is none.
 */
export const describeFrequency = (option: FrequencyOption): string => {
  if (option.type === FrequencyType.Custom && option.intervalDays !== null) {
    return option.intervalDays === 1
      ? "Every day"
      : `Every ${option.intervalDays} days`;
  }

  return option.description?.trim() ?? "";
};
