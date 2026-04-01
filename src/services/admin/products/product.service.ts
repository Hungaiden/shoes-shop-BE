import Product from "../../../models/products/product.model";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "../../../validations/products/productSchema.zod";
import * as paramsTypes from "../../../utils/types/paramsTypes";

// Tạo sản phẩm mới
export const createProduct = async (raw: any) => {
  const result = CreateProductSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.format()));
  }

  const data = result.data;

  if (data.sku) {
    const existing = await Product.findOne({ sku: data.sku });
    if (existing) {
      throw new Error("SKU đã tồn tại!");
    }
  }

  const newProduct = new Product(data);
  await newProduct.save();
  return newProduct;
};

// Lấy tất cả sản phẩm
export const getAllProducts = async (
  filter?: paramsTypes.ProductFilterParams,
  searchParams?: paramsTypes.SearchParams,
  sortParams?: paramsTypes.SortParams,
  paginateParams?: paramsTypes.PaginateParams,
) => {
  try {
    const query: any = { deletedAt: null };

    if (filter?.status) query.status = filter.status;
    if (filter?.minPrice !== undefined)
      query.price = { ...query.price, $gte: filter.minPrice };
    if (filter?.maxPrice !== undefined)
      query.price = { ...query.price, $lte: filter.maxPrice };
    if (filter?.category) query.category = filter.category;
    if (filter?.brand) query.brand = filter.brand;
    if (filter?.isFeatured !== undefined) query.isFeatured = filter.isFeatured;

    if (searchParams?.keyword && searchParams?.field) {
      query[searchParams.field] = {
        $regex: searchParams.keyword,
        $options: "i",
      };
    }

    const offset = paginateParams?.offset || 0;
    const limit = paginateParams?.limit || 10;

    const sortQuery: any = {};
    if (sortParams?.sortBy) {
      sortQuery[sortParams.sortBy] =
        sortParams.sortType === paramsTypes.SORT_TYPE.ASC ? 1 : -1;
    }

    const totalRows = await Product.countDocuments(query);
    const safeOffset = offset > totalRows ? 0 : offset;

    const products = await Product.find(query)
      .skip(safeOffset)
      .limit(limit)
      .sort(sortQuery)
      .populate("category", "title")
      .lean();

    const totalPages = Math.ceil(totalRows / limit);

    return { products, totalRows, totalPages };
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách sản phẩm!");
  }
};

// Lấy sản phẩm theo ID
export const getProductByIdService = async (id: string) => {
  try {
    const product = await Product.findOne({ _id: id, deletedAt: null })
      .populate("category", "title")
      .lean();
    if (!product) {
      throw new Error("Sản phẩm không tồn tại!");
    }
    return product;
  } catch (error) {
    throw new Error("Lỗi khi lấy thông tin sản phẩm!");
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (id: string, raw: any) => {
  try {
    const result = UpdateProductSchema.safeParse({ _id: id, ...raw });
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.format()));
    }

    const { _id, ...data } = result.data;
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true },
    );
    return updatedProduct;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi khi cập nhật sản phẩm!");
  }
};

// Xóa mềm sản phẩm
export const deleteOneProduct = async (id: string) => {
  try {
    const deletedProduct = await Product.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    );
    return deletedProduct;
  } catch (error) {
    throw new Error("Lỗi khi xóa sản phẩm!");
  }
};

// Lấy sản phẩm theo category
export const getProductsByCategory = async (
  category: string,
  searchParams?: paramsTypes.SearchParams,
  sortParams?: paramsTypes.SortParams,
  paginateParams?: paramsTypes.PaginateParams,
) => {
  try {
    const query: any = { deletedAt: null, category };

    if (searchParams?.keyword && searchParams?.field) {
      query[searchParams.field] = {
        $regex: searchParams.keyword,
        $options: "i",
      };
    }

    const offset = paginateParams?.offset || 0;
    const limit = paginateParams?.limit || 10;

    const sortQuery: any = {};
    if (sortParams?.sortBy) {
      sortQuery[sortParams.sortBy] =
        sortParams.sortType === paramsTypes.SORT_TYPE.ASC ? 1 : -1;
    }

    const products = await Product.find(query)
      .skip(offset)
      .limit(limit)
      .sort(sortQuery)
      .lean();

    const totalRows = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalRows / limit);

    return { products, totalRows, totalPages };
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách sản phẩm theo category!");
  }
};
