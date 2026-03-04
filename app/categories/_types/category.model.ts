import type { CategoryType } from "@/types/shared/enums";

export interface Category {
  id: string;
  name: string;
  categoryType: CategoryType;
  createdAt: Date;
  isActive: boolean;
}
