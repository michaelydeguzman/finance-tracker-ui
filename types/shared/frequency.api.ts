import type { FrequencyType } from "./enums";

export interface FrequencyResponse {
  id: string;
  name: string;
  type: FrequencyType;
  intervalDays: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}
