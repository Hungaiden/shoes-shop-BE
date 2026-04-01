export interface CreateProductCategoryDto {
  title: string;
  description?: string;
  image?: string;
  status?: "active" | "inactive";
  position?: number;
}
