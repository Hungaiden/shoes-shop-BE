import { Response, Request } from "express";
import type {
  ResponseDetailSuccess,
  ResponseListSuccess,
  ResponseFailure,
} from "../../../utils/types/ResponseTypes";
import { Account } from "../../../models/accounts/account.model";
import { ProductBooking } from "../../../models/products/productBooking.model";
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User is already attached to request by auth middleware
    const user = req.jwtDecoded;
    const id = user.userId;
    const account = await Account.findOne({
      _id: id,
      deleted: false,
    });
    const response: ResponseDetailSuccess<typeof account> = {
      code: 200,
      message: "Lấy thông tin tài khoản thành công",
      data: account,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const user = req.jwtDecoded;
    const id = user.userId;
    const bookings = await ProductBooking.find({
      user_id: id,
    }).populate("items.product_id");
    const response: ResponseListSuccess<typeof bookings> = {
      code: 200,
      message: "Lấy danh sách booking thành công",
      data: {
        hits: bookings,
        pagination: {
          totalRows: bookings.length,
          totalPages: 1,
        },
      },
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
