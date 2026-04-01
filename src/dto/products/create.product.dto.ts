export type ProductStatus = "active" | "inactive" | "out_of_stock";

export interface CreateProductDto {
  name: string; // bắt buộc
  sku?: string; // unique
  description?: string;
  price: number; // bắt buộc
  discount?: number; // % giảm giá, default 0
  images?: string[];
  thumbnail?: string;
  brand?: string;
  category?: string;
  sizes?: string[]; // ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  colors?: string[];
  material?: string;
  stock: number; // bắt buộc
  isFeatured?: boolean;
  status?: ProductStatus;
}
