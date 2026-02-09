import { CategoryTypes } from "./category.model";

export interface CreateCategoryRequest {
  name: string;
  categoryType: CategoryTypes;
  isActive?: boolean;
}

export interface CategoryApiResponse {
  id: string;
  name: string;
  categoryType: CategoryTypes;
  createdAt: string;
  isActive: boolean;
}
