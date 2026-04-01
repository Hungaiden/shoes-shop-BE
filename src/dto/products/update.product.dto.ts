import type { ProductStatus } from "./create.product.dto";

export interface UpdateProductDto {
  _id: string;
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  discount?: number;
  images?: string[];
  thumbnail?: string;
  brand?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
  material?: string;
  stock?: number;
  isFeatured?: boolean;
  status?: ProductStatus;
}
