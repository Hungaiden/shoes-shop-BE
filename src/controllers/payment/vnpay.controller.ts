import type { Request, Response, NextFunction } from "express";
import moment from "moment";
import crypto from "crypto";
import { sortObject } from "../../utils/sortObject";
import qs from "qs";
import { ProductBooking } from "../../models/products/productBooking.model";
import {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
  HashAlgorithm,
} from "vnpay";

export const createPaymentUrl = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.bookingId;
    if (!bookingId) {
      throw new Error("Missing bookingId");
    }

    const booking = await ProductBooking.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const returnUrl =
      process.env.VNP_RETURN_URL ||
      "http://localhost:3000/payment/vnpay-return";
    const configuredVnpUrl =
      process.env.VNP_URL ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    if (!tmnCode || !secretKey) {
      res.status(500).json({
        message: "Missing VNPay configuration (VNP_TMN_CODE/VNP_HASH_SECRET)",
      });
      return;
    }

    const parsedVnpUrl = new URL(configuredVnpUrl);
    const paymentEndpoint =
      parsedVnpUrl.pathname.replace(/^\/+/, "") || "paymentv2/vpcpay.html";
    const orderInfo = `Thanh toan booking ${bookingId}`;

    const vnpay = new VNPay({
      tmnCode: tmnCode,
      secureSecret: secretKey,
      vnpayHost: parsedVnpUrl.origin,
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      enableLog: true,
      loggerFn: ignoreLogger,
      endpoints: {
        paymentEndpoint, // Endpoint thanh toán
        queryDrRefundEndpoint: "merchant_webapi/api/transaction", // Endpoint tra cứu & hoàn tiền
        getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list", // Endpoint lấy danh sách ngân hàng
      },
    });

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: booking.total_price,
      vnp_IpAddr: "13.160.92.202",
      vnp_TxnRef: bookingId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(new Date(Date.now() + 30 * 60 * 1000)),
    });

    res.json(vnpayResponse);
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const vnpayReturn = async (req: Request, res: Response) => {
  try {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params["vnp_SecureHash"] as string;
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const secretKey = process.env.VNP_HASH_SECRET;
    if (!secretKey) {
      res.status(500).json({ message: "Missing VNP_HASH_SECRET" });
      return;
    }

    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // if (secureHash !== signed) {
    //     res.status(400).json({ message: "Invalid secure hash" });
    //     return;
    // }

    const responseCode = vnp_Params["vnp_ResponseCode"];
    const transactionStatus = vnp_Params["vnp_TransactionStatus"];
    const bookingId = vnp_Params["vnp_TxnRef"];

    let update: any;
    if (
      responseCode === "00" &&
      (!transactionStatus || transactionStatus === "00")
    ) {
      // Thanh toán thành công
      update = {
        payment_status: "paid",
        status: "confirmed",
        transaction_code: vnp_Params["vnp_TransactionNo"],
        payment_time: new Date(),
        vnp_response_code: responseCode,
      };
    } else {
      // Thanh toán thất bại
      update = {
        payment_status: "failed",
        status: "cancelled",
        vnp_response_code: responseCode,
      };
    }

    const updatedBooking = await ProductBooking.findByIdAndUpdate(
      bookingId,
      update,
    );
    if (!updatedBooking) {
      res.status(404).json({ message: "Booking not found" });
    }

    // Redirect người dùng về FE (tuỳ thuộc kết quả)
    // const FE_URL = "https://book-tour-khaki.vercel.app/payment/result";
    const FE_URL = "http://localhost:3001/payment";
    res.redirect(
      `${FE_URL}?status=${update.payment_status}&bookingId=${bookingId}`,
    );
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const vnpayIPN = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params["vnp_SecureHash"] as string;
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const secretKey = process.env.VNP_HASH_SECRET;
    if (!secretKey) {
      res.status(500).json({ message: "Missing VNP_HASH_SECRET" });
      return;
    }

    // Kiểm tra hash
    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash !== signed) {
      res.status(400).json({
        RspCode: "97",
        Message: "Invalid signature",
      });
      return;
    }

    const bookingId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const transactionStatus = vnp_Params["vnp_TransactionStatus"];
    const transactionCode = vnp_Params["vnp_TransactionNo"];

    const booking = await ProductBooking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        RspCode: "01",
        Message: "Booking not found",
      });
      return;
    }

    // Nếu booking đã cập nhật rồi thì bỏ qua
    if (booking.payment_status === "paid") {
      res.status(200).json({
        RspCode: "00",
        Message: "Already processed",
      });
      return;
    }

    let update;
    if (responseCode === "00" && transactionStatus === "00") {
      update = {
        payment_status: "paid",
        status: "confirmed",
        transaction_code: transactionCode,
        payment_time: new Date(),
        vnp_response_code: responseCode,
      };
    } else {
      update = {
        payment_status: "failed",
        status: "cancelled",
        vnp_response_code: responseCode,
      };
    }

    await ProductBooking.findByIdAndUpdate(bookingId, update);

    // Phản hồi về cho VNPay
    res.status(200).json({ RspCode: "00", Message: "Success" });
  } catch (error) {
    console.error("VNPay IPN error:", error);
    res.status(500).json({ RspCode: "99", Message: "Unknown error" });
  }
};
