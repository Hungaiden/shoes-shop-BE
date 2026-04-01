export interface CreateProductReviewDto {
  product_id: string;
  user_id: string;
  booking_id?: string;
  rating: number;
  comment?: string;
  images?: string[];
  size?: string;
  color?: string;
}
