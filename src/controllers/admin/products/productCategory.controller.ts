import type { Request, Response } from "express";
import * as productCategoryService from "../../../services/admin/products/productCategory.service";
import type * as paramsTypes from "../../../utils/types/paramsTypes";
import type {
  ResponseDetailSuccess,
  ResponseListSuccess,
  ResponseFailure,
} from "../../../utils/types/ResponseTypes";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await productCategoryService.createProductCategory(
      req.body,
    );
    const response: ResponseDetailSuccess<typeof category> = {
      code: 201,
      message: "Tạo danh mục sản phẩm thành công",
      data: category,
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

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const filter = { status: req.query.status as string };
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

    const result = await productCategoryService.getAllProductCategories(
      searchParams,
      sortParams,
      paginateParams,
      filter,
    );
    const response: ResponseListSuccess<typeof result.categories> = {
      code: 200,
      message: result.categories.length
        ? "Lấy danh sách danh mục sản phẩm thành công"
        : "Không tìm thấy danh mục nào",
      data: {
        hits: result.categories,
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

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await productCategoryService.getProductCategoryById(
      req.params.id,
    );
    if (!category) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Không tìm thấy danh mục sản phẩm",
        errors: [],
      };
      res.status(404).json(response);
      return;
    }
    const response: ResponseDetailSuccess<typeof category> = {
      code: 200,
      message: "Lấy thông tin danh mục sản phẩm thành công",
      data: category,
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

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await productCategoryService.updateProductCategory(
      req.params.id,
      req.body,
    );
    if (!category) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Không tìm thấy danh mục sản phẩm",
        errors: [],
      };
      res.status(404).json(response);
      return;
    }
    const response: ResponseDetailSuccess<typeof category> = {
      code: 200,
      message: "Cập nhật danh mục sản phẩm thành công",
      data: category,
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

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await productCategoryService.deleteProductCategory(
      req.params.id,
    );
    if (!category) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Không tìm thấy danh mục sản phẩm",
        errors: [],
      };
      res.status(404).json(response);
      return;
    }
    const response: ResponseDetailSuccess<typeof category> = {
      code: 200,
      message: "Xóa danh mục sản phẩm thành công",
      data: category,
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
