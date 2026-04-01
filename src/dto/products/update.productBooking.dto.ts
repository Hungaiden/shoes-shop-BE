export interface UpdateProductBookingDto {
  status?: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  transaction_code?: string;
  payment_time?: Date;
  vnp_response_code?: string;
  payment_url?: string;
}
