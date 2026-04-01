import type { Request, Response } from "express";
import * as adminCartService from "../../../services/admin/cart/adminCart.service";
import type {
  ResponseDetailSuccess,
  ResponseListSuccess,
  ResponseFailure,
} from "../../../utils/types/ResponseTypes";

// GET /admin-carts — Lấy danh sách tất cả giỏ hàng
export const getAllCarts = async (req: Request, res: Response) => {
  try {
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const keyword = req.query.keyword as string | undefined;

    const result = await adminCartService.getAllCarts({
      offset,
      limit,
      keyword,
    });

    const response: ResponseListSuccess<typeof result.carts> = {
      code: 200,
      message: "Lấy danh sách giỏ hàng thành công",
      data: {
        hits: result.carts,
        pagination: {
          totalRows: result.totalRows,
          totalPages: result.totalPages,
        },
      },
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: "Lỗi khi lấy danh sách giỏ hàng!",
      errors: [],
    };
    res.status(500).json(response);
  }
};

// GET /admin-carts/:userId — Lấy giỏ hàng của 1 user
export const getCartByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const cart = await adminCartService.getCartByUserId(userId);

    const response: ResponseDetailSuccess<typeof cart> = {
      code: 200,
      message: "Lấy giỏ hàng thành công",
      data: cart,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || "Lỗi khi lấy giỏ hàng!",
      errors: [],
    };
    res.status(500).json(response);
  }
};

// DELETE /admin-carts/:userId/clear — Xoá toàn bộ giỏ hàng của user
export const clearUserCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const cart = await adminCartService.clearCartByUserId(userId);

    const response: ResponseDetailSuccess<typeof cart> = {
      code: 200,
      message: "Đã xoá toàn bộ giỏ hàng",
      data: cart,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || "Lỗi khi xoá giỏ hàng!",
      errors: [],
    };
    res.status(400).json(response);
  }
};

// DELETE /admin-carts/:userId/item/:itemId — Xoá 1 item khỏi giỏ hàng của user
export const removeUserCartItem = async (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.params;
    const cart = await adminCartService.removeItemFromCart(userId, itemId);

    const response: ResponseDetailSuccess<typeof cart> = {
      code: 200,
      message: "Đã xoá sản phẩm khỏi giỏ hàng",
      data: cart,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || "Lỗi khi xoá sản phẩm!",
      errors: [],
    };
    res.status(400).json(response);
  }
};
