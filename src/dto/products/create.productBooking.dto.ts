export interface BookingItemDto {
  product_id: string;
  name?: string;
  thumbnail?: string;
  price: number;
  discount: number;
  size: string;
  color?: string;
  quantity: number;
  subtotal?: number;
}

export interface CreateProductBookingDto {
  user_id?: string;
  items: BookingItemDto[];
  contact_info: {
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
  note?: string;
  total_price?: number;
  discount_id?: string;
  discount_code?: string;
  discount_amount?: number;
  payment_method?: 'vnpay' | 'momo' | 'cash' | 'bank_transfer';
}
