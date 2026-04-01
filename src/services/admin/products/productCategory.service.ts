import { ProductCategory } from "../../../models/products/productCategory.model";
import type { CreateProductCategoryDto } from "../../../dto/products/create.productCategory.dto";
import type { UpdateProductCategoryDto } from "../../../dto/products/update.productCategory.dto";
import * as paramsTypes from "../../../utils/types/paramsTypes";

export const createProductCategory = async (data: CreateProductCategoryDto) => {
  const existing = await ProductCategory.findOne({ title: data.title });
  if (existing) {
    throw new Error("Tên danh mục sản phẩm đã tồn tại!");
  }
  const newCategory = new ProductCategory(data);
  await newCategory.save();
  return newCategory;
};

export const getAllProductCategories = async (
  searchParams?: paramsTypes.SearchParams,
  sortParams?: paramsTypes.SortParams,
  paginateParams?: paramsTypes.PaginateParams,
  filter?: { status?: string },
) => {
  const query: any = { deleted: false };
  if (filter?.status) query.status = filter.status;
  if (searchParams?.keyword && searchParams?.field) {
    query[searchParams.field] = { $regex: searchParams.keyword, $options: "i" };
  }

  const offset = paginateParams?.offset || 0;
  const limit = paginateParams?.limit || 10;

  const sortQuery: any = {};
  if (sortParams?.sortBy) {
    sortQuery[sortParams.sortBy] =
      sortParams.sortType === paramsTypes.SORT_TYPE.ASC ? 1 : -1;
  } else {
    sortQuery.position = 1;
  }

  const categories = await ProductCategory.find(query)
    .skip(offset)
    .limit(limit)
    .sort(sortQuery)
    .lean();

  const totalRows = await ProductCategory.countDocuments(query);
  const totalPages = Math.ceil(totalRows / limit);
  return { categories, totalRows, totalPages };
};

export const getProductCategoryById = async (id: string) => {
  const category = await ProductCategory.findOne({ _id: id, deleted: false });
  return category;
};

export const updateProductCategory = async (
  id: string,
  data: UpdateProductCategoryDto,
) => {
  const updated = await ProductCategory.findOneAndUpdate(
    { _id: id, deleted: false },
    data,
    { new: true },
  );
  return updated;
};

export const deleteProductCategory = async (id: string) => {
  const deleted = await ProductCategory.findOneAndUpdate(
    { _id: id, deleted: false },
    { deleted: true, deleted_at: new Date() },
    { new: true },
  );
  return deleted;
};
