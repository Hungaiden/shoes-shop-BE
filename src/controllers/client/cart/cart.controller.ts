import type { Request, Response } from 'express';
import * as cartService from '../../../services/client/cart/cart.service';
import type { ResponseDetailSuccess, ResponseFailure } from '../../../utils/types/ResponseTypes';

const getRequesterUserId = (req: Request): string | undefined => {
  return req.jwtDecoded?.userId || req.jwtDecoded?._id;
};

// GET /cart — Lấy giỏ hàng
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = getRequesterUserId(req);
    if (!userId) {
      const response: ResponseFailure = {
        code: 401,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Unauthorized',
        errors: [],
      };
      res.status(401).json(response);
      return;
    }
    const cart = await cartService.getCart(userId);

    const response: ResponseDetailSuccess<typeof cart> = {
      code: 200,
      message: 'Lấy giỏ hàng thành công',
      data: cart,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Lỗi khi lấy giỏ hàng!',
      errors: [],
    };
    res.status(500).json(response);
  }
};

// POST /cart/add — Thêm sản phẩm vào giỏ
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = getRequesterUserId(req);
    if (!userId) {
      const response: ResponseFailure = {
        code: 401,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Unauthorized',
        errors: [],
      };
      res.status(401).json(response);
      return;
    }
    const { product_id, quantity, size, color } = req.body;

    if (!product_id) {
      const response: ResponseFailure = {
        code: 400,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'product_id là bắt buộc!',
        errors: [],
      };
      res.status(400).json(response);
      return;
    }

    const cart = await cartService.addToCart(userId, product_id, quantity, size, color);

    const response: ResponseDetailSuccess<typeof cart> = {
      code: 200,
      message: 'Thêm sản phẩm vào giỏ hàng thành công',
      data: cart,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Lỗi khi thêm vào giỏ hàng!',
      errors: [],
    };
    res.status(400).json(response);
  }
};

// PATCH /cart/update/:itemId — Cập nhật item trong giỏ
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = getRequesterUserId(req);
    if (!userId) {
      const response: ResponseFailure = {
        code: 401,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Unauthorized',
        errors: [],
      };
      res.status(401).json(response);
      return;
    }
    const { itemId } = req.params;
    const { quantity, size, color } = req.body;

    const cart = await cartService.updateCartItem(userId, itemId, {
      quantity,
      size,
      color,
    });

    const response: ResponseDetailSuccess<typeof cart> = {
      code: 200,
      message: 'Cập nhật giỏ hàng thành công',
      data: cart,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Lỗi khi cập nhật giỏ hàng!',
      errors: [],
    };
    res.status(400).json(response);
  }
};

// DELETE /cart/remove/:itemId — Xoá một sản phẩm khỏi giỏ
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const userId = getRequesterUserId(req);
    if (!userId) {
      const response: ResponseFailure = {
        code: 401,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Unauthorized',
        errors: [],
      };
      res.status(401).json(response);
      return;
    }
    const { itemId } = req.params;

    const cart = await cartService.removeCartItem(userId, itemId);

    const response: ResponseDetailSuccess<typeof cart> = {
      code: 200,
      message: 'Xoá sản phẩm khỏi giỏ hàng thành công',
      data: cart,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Lỗi khi xoá sản phẩm khỏi giỏ hàng!',
      errors: [],
    };
    res.status(400).json(response);
  }
};

// DELETE /cart/clear — Xoá toàn bộ giỏ hàng
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = getRequesterUserId(req);
    if (!userId) {
      const response: ResponseFailure = {
        code: 401,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Unauthorized',
        errors: [],
      };
      res.status(401).json(response);
      return;
    }
    await cartService.clearCart(userId);

    const response: ResponseDetailSuccess<null> = {
      code: 200,
      message: 'Xoá toàn bộ giỏ hàng thành công',
      data: null,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Lỗi khi xoá giỏ hàng!',
      errors: [],
    };
    res.status(400).json(response);
  }
};
