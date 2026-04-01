import type { Request, Response, NextFunction } from 'express';
import { ProductBooking } from '../models/products/productBooking.model';
import mongoose from 'mongoose';

// Middleware kiểm tra xem user đã mua sản phẩm chưa (chỉ cho review sản phẩm đã mua)
export const hasPurchased = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtDecoded?.userId || req.jwtDecoded?._id;
    const productId = req.body.product_id || req.query.product_id;

    if (!userId || !productId) {
      res.status(400).json({
        code: 400,
        message: 'Thiếu thông tin user hoặc product',
        errors: [],
      });
      return;
    }

    // Kiểm tra xem user đã có đơn hàng delivered/shipping chứa sản phẩm này không
    // Cho phép review nếu: đơn hàng đã shipped/delivered HOẶC đơn hàng confirmed + payment paid
    const purchase = await ProductBooking.findOne({
      user_id: new mongoose.Types.ObjectId(userId),
      'items.product_id': new mongoose.Types.ObjectId(productId),
      $or: [
        { status: { $in: ['delivered', 'shipping'] } }, // Already received
        { status: 'confirmed', payment_status: 'paid' }, // Confirmed & paid
      ],
      deleted: false,
    });

    if (!purchase) {
      res.status(403).json({
        code: 403,
        message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua',
        errors: [],
      });
      return;
    }

    // Lưu booking_id vào request để sử dụng sau
    req.body.booking_id = purchase._id;
    next();
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: 'Lỗi khi kiểm tra lịch sử mua hàng',
      errors: [error.message],
    });
  }
};
