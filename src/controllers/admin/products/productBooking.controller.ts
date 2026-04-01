import type { Request, Response } from "express";
import * as productBookingService from "../../../services/admin/products/productBooking.service";
import type * as paramsTypes from "../../../utils/types/paramsTypes";
import type {
  ResponseDetailSuccess,
  ResponseListSuccess,
  ResponseFailure,
} from "../../../utils/types/ResponseTypes";

export const createProductBooking = async (req: Request, res: Response) => {
  try {
    const booking = await productBookingService.createProductBooking({
      ...req.body,
      user_id: req.jwtDecoded?.userId,
    });
    const response: ResponseDetailSuccess<typeof booking> = {
      code: 201,
      message: "Đặt hàng thành công",
      data: booking,
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

export const getAllProductBookings = async (req: Request, res: Response) => {
  try {
    const filter = {
      status: req.query.status as string,
      payment_status: req.query.payment_status as string,
    };
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

    const result = await productBookingService.getAllProductBookings(
      searchParams,
      sortParams,
      paginateParams,
      filter,
    );
    const response: ResponseListSuccess<typeof result.bookings> = {
      code: 200,
      message: result.bookings.length
        ? "Lấy danh sách đơn hàng thành công"
        : "Không có đơn hàng nào",
      data: {
        hits: result.bookings,
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

export const getProductBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await productBookingService.getProductBookingById(
      req.params.bookingId,
    );
    if (!booking) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Không tìm thấy đơn hàng",
        errors: [],
      };
      res.status(404).json(response);
      return;
    }
    const response: ResponseDetailSuccess<typeof booking> = {
      code: 200,
      message: "Lấy thông tin đơn hàng thành công",
      data: booking,
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

export const getProductBookingsByUserId = async (
  req: Request,
  res: Response,
) => {
  try {
    const requesterId = req.jwtDecoded?.userId as string | undefined;
    const requesterRole = req.jwtDecoded?.role as string | undefined;

    if (!requesterId) {
      const response: ResponseFailure = {
        code: 401,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Unauthorized",
        errors: [],
      };
      res.status(401).json(response);
      return;
    }

    if (requesterRole !== "admin" && requesterId !== req.params.userId) {
      const response: ResponseFailure = {
        code: 403,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Bạn không có quyền xem đơn hàng của người dùng khác",
        errors: [],
      };
      res.status(403).json(response);
      return;
    }

    const sortParams: paramsTypes.SortParams = {
      sortBy: req.query.sortBy as string,
      sortType: req.query.sortType as paramsTypes.SORT_TYPE,
    };
    const paginateParams: paramsTypes.PaginateParams = {
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    const result = await productBookingService.getProductBookingsByUserId(
      req.params.userId,
      sortParams,
      paginateParams,
    );
    const response: ResponseListSuccess<typeof result.bookings> = {
      code: 200,
      message: result.bookings.length
        ? "Lấy danh sách đơn hàng của người dùng thành công"
        : "Người dùng chưa có đơn hàng nào",
      data: {
        hits: result.bookings,
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

export const updateProductBooking = async (req: Request, res: Response) => {
  try {
    const booking = await productBookingService.updateProductBooking(
      req.params.bookingId,
      req.body,
    );
    if (!booking) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Không tìm thấy đơn hàng",
        errors: [],
      };
      res.status(404).json(response);
      return;
    }
    const response: ResponseDetailSuccess<typeof booking> = {
      code: 200,
      message: "Cập nhật đơn hàng thành công",
      data: booking,
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

export const deleteProductBooking = async (req: Request, res: Response) => {
  try {
    const booking = await productBookingService.deleteProductBooking(
      req.params.bookingId,
    );
    if (!booking) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Không tìm thấy đơn hàng",
        errors: [],
      };
      res.status(404).json(response);
      return;
    }
    const response: ResponseDetailSuccess<typeof booking> = {
      code: 200,
      message: "Xóa đơn hàng thành công",
      data: booking,
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
