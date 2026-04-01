type BookingType = 'tour' | 'hotel' | 'flight';

export interface BaseBooking {
  userEmail: string;
  bookingType: BookingType;
  data: any; // dữ liệu booking tương ứng
}
