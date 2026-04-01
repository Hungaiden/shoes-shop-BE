export interface UpdateProductCategoryDto {
  _id: string;
  title?: string;
  description?: string;
  image?: string;
  status?: "active" | "inactive";
  position?: number;
}
