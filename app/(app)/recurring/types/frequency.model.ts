import type { FrequencyType } from "@/types/shared/enums";

/** A frequency option as the picker renders it. */
export interface FrequencyOption {
  id: string;
  name: string;
  type: FrequencyType;
  /** Only meaningful for `FrequencyType.Custom`. */
  intervalDays: number | null;
  description: string | null;
  /**
   * `GET /recurring-options` returns every frequency row, active or not, while
   * create and update reject an inactive one. Kept on the option so the picker
   * can leave those out rather than offering a choice that fails on save.
   */
  isActive: boolean;
}
