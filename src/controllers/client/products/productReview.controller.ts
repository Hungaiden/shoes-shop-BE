import type { Request, Response } from 'express';
import * as productReviewService from '../../../services/admin/products/productReview.service';
import type * as paramsTypes from '../../../utils/types/paramsTypes';
import type {
  ResponseDetailSuccess,
  ResponseListSuccess,
  ResponseFailure,
} from '../../../utils/types/ResponseTypes';

// POST /products/reviews - Tạo đánh giá (client)
export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = req.jwtDecoded.userId || req.jwtDecoded._id;
    const { product_id, rating, comment, images, size, color } = req.body;

    // Kiểm tra user chỉ có thể review 1 lần cho 1 sản phẩm
    const existingReview = await productReviewService.checkExistingReview(product_id, userId);

    if (existingReview) {
      const response: ResponseFailure = {
        code: 400,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Bạn đã đánh giá sản phẩm này rồi. Vui lòng cập nhật đánh giá cũ.',
        errors: [],
      };
      res.status(400).json(response);
      return;
    }

    const review = await productReviewService.createProductReview({
      product_id,
      user_id: userId,
      booking_id: req.body.booking_id,
      rating,
      comment,
      images: images || [],
      size: size || '',
      color: color || '',
    });

    const response: ResponseDetailSuccess<typeof review> = {
      code: 201,
      message: 'Đánh giá sản phẩm thành công. Đánh giá sẽ hiển thị sau khi được duyệt.',
      data: review,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Lỗi khi tạo đánh giá',
      errors: [],
    };
    res.status(400).json(response);
  }
};

// PATCH /products/reviews/:id - Cập nhật đánh giá của user
export const updateReview = async (req: Request, res: Response) => {
  try {
    const userId = req.jwtDecoded.userId || req.jwtDecoded._id;
    const reviewId = req.params.id;
    const { rating, comment, images, size, color } = req.body;

    // Kiểm tra review có tồn tại và thuộc về user hiện tại
    const review = await productReviewService.getReviewById(reviewId);

    if (!review) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Đánh giá không tồn tại',
        errors: [],
      };
      res.status(404).json(response);
      return;
    }

    if (review.user_id.toString() !== userId) {
      const response: ResponseFailure = {
        code: 403,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Bạn chỉ có thể cập nhật đánh giá của chính mình',
        errors: [],
      };
      res.status(403).json(response);
      return;
    }

    const updatedReview = await productReviewService.updateProductReview(reviewId, {
      rating,
      comment: comment || '',
      images: images || [],
      size: size || '',
      color: color || '',
    });

    const response: ResponseDetailSuccess<typeof updatedReview> = {
      code: 200,
      message: 'Cập nhật đánh giá thành công',
      data: updatedReview,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Lỗi khi cập nhật đánh giá',
      errors: [],
    };
    res.status(400).json(response);
  }
};

// DELETE /products/reviews/:id - Xóa đánh giá của user
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = req.jwtDecoded.userId || req.jwtDecoded._id;
    const reviewId = req.params.id;

    // Kiểm tra review có tồn tại và thuộc về user hiện tại
    const review = await productReviewService.getReviewById(reviewId);

    if (!review) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Đánh giá không tồn tại',
        errors: [],
      };
      res.status(404).json(response);
      return;
    }

    if (review.user_id.toString() !== userId) {
      const response: ResponseFailure = {
        code: 403,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Bạn chỉ có thể xóa đánh giá của chính mình',
        errors: [],
      };
      res.status(403).json(response);
      return;
    }

    const deletedReview = await productReviewService.deleteProductReview(reviewId);

    const response: ResponseDetailSuccess<typeof deletedReview> = {
      code: 200,
      message: 'Xóa đánh giá thành công',
      data: deletedReview,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Lỗi khi xóa đánh giá',
      errors: [],
    };
    res.status(400).json(response);
  }
};

// GET /products/reviews/:productId - Lấy danh sách đánh giá approved của sản phẩm
export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const sortParams: paramsTypes.SortParams = {
      sortBy: req.query.sortBy as string,
      sortType: req.query.sortType as paramsTypes.SORT_TYPE,
    };
    const paginateParams: paramsTypes.PaginateParams = {
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    const result = await productReviewService.getProductReviewsByProductId(
      productId,
      sortParams,
      paginateParams,
    );

    const response: ResponseListSuccess<typeof result.reviews> = {
      code: 200,
      message: result.reviews.length
        ? 'Lấy danh sách đánh giá thành công'
        : 'Sản phẩm chưa có đánh giá nào',
      data: {
        hits: result.reviews,
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
      message: error.message || 'Lỗi khi lấy danh sách đánh giá',
      errors: [],
    };
    res.status(500).json(response);
  }
};
