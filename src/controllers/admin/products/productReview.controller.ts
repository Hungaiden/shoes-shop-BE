import type { Request, Response } from "express";
import * as productReviewService from "../../../services/admin/products/productReview.service";
import type * as paramsTypes from "../../../utils/types/paramsTypes";
import type {
  ResponseDetailSuccess,
  ResponseListSuccess,
  ResponseFailure,
} from "../../../utils/types/ResponseTypes";

export const createReview = async (req: Request, res: Response) => {
  try {
    const review = await productReviewService.createProductReview({
      ...req.body,
      user_id: req.jwtDecoded.userId,
    });
    const response: ResponseDetailSuccess<typeof review> = {
      code: 201,
      message: "Đánh giá sản phẩm thành công",
      data: review,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message,
      errors: [],
    };
    res.status(400).json(response);
  }
};

export const approveReview = async (req: Request, res: Response) => {
  try {
    const review = await productReviewService.approveProductReview(
      req.params.id,
    );
    const response: ResponseDetailSuccess<typeof review> = {
      code: 200,
      message: "Duyệt đánh giá thành công",
      data: review,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message,
      errors: [],
    };
    res.status(400).json(response);
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await productReviewService.updateProductReview(
      req.params.id,
      req.body,
    );
    const response: ResponseDetailSuccess<typeof review> = {
      code: 200,
      message: "Cập nhật đánh giá thành công",
      data: review,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message,
      errors: [],
    };
    res.status(400).json(response);
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await productReviewService.deleteProductReview(
      req.params.id,
    );
    const response: ResponseDetailSuccess<typeof review> = {
      code: 200,
      message: "Xóa đánh giá thành công",
      data: review,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message,
      errors: [],
    };
    res.status(400).json(response);
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const searchParams: paramsTypes.SearchParams = {
      keyword: req.query.keyword as string,
      field: req.query.field as string,
    };
    const sortParams: paramsTypes.SortParams = {
      sortBy: req.query.sortBy as string,
      sortType: req.query.sortType as paramsTypes.SORT_TYPE,
    };
    const paginateParams: paramsTypes.PaginateParams = {
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    const result = await productReviewService.getAllProductReviews(
      searchParams,
      sortParams,
      paginateParams,
    );
    const response: ResponseListSuccess<typeof result.reviews> = {
      code: 200,
      message: result.reviews.length
        ? "Lấy danh sách đánh giá thành công"
        : "Không có đánh giá nào",
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
      message: error.message,
      errors: [],
    };
    res.status(500).json(response);
  }
};

export const getReviewsByProductId = async (req: Request, res: Response) => {
  try {
    const sortParams: paramsTypes.SortParams = {
      sortBy: req.query.sortBy as string,
      sortType: req.query.sortType as paramsTypes.SORT_TYPE,
    };
    const paginateParams: paramsTypes.PaginateParams = {
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    const result = await productReviewService.getProductReviewsByProductId(
      req.params.productId,
      sortParams,
      paginateParams,
    );
    const response: ResponseListSuccess<typeof result.reviews> = {
      code: 200,
      message: result.reviews.length
        ? "Lấy danh sách đánh giá của sản phẩm thành công"
        : "Sản phẩm chưa có đánh giá nào",
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
      message: error.message,
      errors: [],
    };
    res.status(500).json(response);
  }
};
