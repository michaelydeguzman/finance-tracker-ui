export interface Category {
  id: string;
  name: string;
  categoryType: CategoryTypes;
  createdAt: Date;
  isActive: boolean;
}

export enum CategoryTypes {
  INCOME = "income",
  EXPENSE = "expense",
}
