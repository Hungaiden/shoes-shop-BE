import { Router } from "express";
import { 
  createPaymentUrl,
  vnpayIPN,
  vnpayReturn,
} from "../../../controllers/payment/vnpay.controller";

const router = Router();

// Tạo link thanh toán và redirect người dùng đến VNPay để thanh toán.
router.post("/create-payment-url/:bookingId", createPaymentUrl);

//VNPay sẽ redirect người dùng về trang của bạn sau khi thanh toán (dù thành công hay thất bại).
router.get("/vnpay-return", vnpayReturn);

router.get("/vnpay-ipn", vnpayIPN);


export const VNPayRoute: Router = router;
