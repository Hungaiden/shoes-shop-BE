import type { Request, Response } from "express";
import * as productService from "../../../services/admin/products/product.service";
import { importProductsFromBuffer } from "../../../services/admin/products/importProduct.service";
import type * as paramsTypes from "../../../utils/types/paramsTypes";
import type {
  ResponseDetailSuccess,
  ResponseListSuccess,
  ResponseFailure,
} from "../../../utils/types/ResponseTypes";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);
    const response: ResponseDetailSuccess<typeof product> = {
      code: 201,
      message: "Tạo sản phẩm thành công",
      data: product,
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

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const filter: paramsTypes.ProductFilterParams = {
      status: req.query.status as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      category: req.query.category as string,
      brand: req.query.brand as string,
      isFeatured:
        req.query.isFeatured !== undefined
          ? req.query.isFeatured === "true"
          : undefined,
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

    const result = await productService.getAllProducts(
      filter,
      searchParams,
      sortParams,
      paginateParams,
    );

    if (result.products.length === 0) {
      const response: ResponseListSuccess<typeof result.products> = {
        code: 200,
        message: "Không tìm thấy sản phẩm nào phù hợp",
        data: {
          hits: [],
          pagination: {
            totalRows: 0,
            totalPages: 0,
          },
        },
      };
      res.status(200).json(response);
      return;
    }

    const response: ResponseListSuccess<typeof result.products> = {
      code: 200,
      message: "Lấy danh sách sản phẩm thành công",
      data: {
        hits: result.products,
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
      message: "Lỗi khi lấy danh sách sản phẩm!",
      errors: [],
    };
    res.status(500).json(response);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductByIdService(req.params.id);
    if (!product) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Không tìm thấy sản phẩm",
        errors: [],
      };
      res.status(404).json(response);
      return;
    }

    const response: ResponseDetailSuccess<typeof product> = {
      code: 200,
      message: "Lấy thông tin sản phẩm thành công",
      data: product,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: "Lỗi khi lấy thông tin sản phẩm!",
      errors: [],
    };
    res.status(500).json(response);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updatedProduct = await productService.updateProduct(
      req.params.id,
      req.body,
    );
    if (!updatedProduct) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Không tìm thấy sản phẩm",
        errors: [],
      };
      res.status(404).json(response);
      return;
    }

    const response: ResponseDetailSuccess<typeof updatedProduct> = {
      code: 200,
      message: "Cập nhật sản phẩm thành công",
      data: updatedProduct,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: "Lỗi khi cập nhật sản phẩm!",
      errors: [],
    };
    res.status(500).json(response);
  }
};

export const deleteOneProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await productService.deleteOneProduct(req.params.id);
    if (!deletedProduct) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "Không tìm thấy sản phẩm",
        errors: [],
      };
      res.status(404).json(response);
      return;
    }

    const response: ResponseDetailSuccess<typeof deletedProduct> = {
      code: 200,
      message: "Xóa sản phẩm thành công",
      data: deletedProduct,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: "Lỗi khi xóa sản phẩm!",
      errors: [],
    };
    res.status(500).json(response);
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
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

    const result = await productService.getProductsByCategory(
      req.params.category,
      searchParams,
      sortParams,
      paginateParams,
    );

    if (result.products.length === 0) {
      const response: ResponseListSuccess<typeof result.products> = {
        code: 200,
        message: "Không tìm thấy sản phẩm nào trong category này",
        data: {
          hits: [],
          pagination: {
            totalRows: 0,
            totalPages: 0,
          },
        },
      };
      res.status(200).json(response);
      return;
    }

    const response: ResponseListSuccess<typeof result.products> = {
      code: 200,
      message: "Lấy danh sách sản phẩm theo category thành công",
      data: {
        hits: result.products,
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

export const importProducts = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        code: 400,
        message: "Vui lòng upload file Excel (.xlsx hoặc .xls)",
      });
      return;
    }

    const result = await importProductsFromBuffer(req.file.buffer);

    res.status(200).json({
      code: 200,
      message: `Import hoàn tất: ${result.success} thành công, ${result.failed} thất bại`,
      data: result,
    });
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message ?? "Lỗi khi import sản phẩm",
      errors: [],
    };
    res.status(500).json(response);
  }
};
