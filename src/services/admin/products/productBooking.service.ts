import { ProductBooking } from "../../../models/products/productBooking.model";
import Product from "../../../models/products/product.model";
import type { CreateProductBookingDto } from "../../../dto/products/create.productBooking.dto";
import type { UpdateProductBookingDto } from "../../../dto/products/update.productBooking.dto";
import * as paramsTypes from "../../../utils/types/paramsTypes";

export const createProductBooking = async (data: CreateProductBookingDto) => {
  if (!data.user_id) {
    throw new Error("Vui lòng đăng nhập để đặt hàng");
  }

  // Validate tồn kho cho từng sản phẩm
  for (const item of data.items) {
    const product = await Product.findById(item.product_id);
    if (!product) {
      throw new Error(`Sản phẩm ${item.name} không tồn tại!`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Sản phẩm ${product.name} không đủ hàng trong kho!`);
    }
  }
  // neu chua co quanlity

  const newBooking = await ProductBooking.create(data);

  // Trừ tồn kho
  for (const item of data.items) {
    await Product.findByIdAndUpdate(item.product_id, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  return newBooking;
};

export const getAllProductBookings = async (
  searchParams?: paramsTypes.SearchParams,
  sortParams?: paramsTypes.SortParams,
  paginateParams?: paramsTypes.PaginateParams,
  filter?: { status?: string; payment_status?: string },
) => {
  const query: any = { deleted: false };
  if (filter?.status) query.status = filter.status;
  if (filter?.payment_status) query.payment_status = filter.payment_status;
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
    sortQuery.created_at = -1;
  }

  const bookings = await ProductBooking.find(query)
    .populate("user_id", "fullName email")
    .skip(offset)
    .limit(limit)
    .sort(sortQuery)
    .lean();

  const totalRows = await ProductBooking.countDocuments(query);
  const totalPages = Math.ceil(totalRows / limit);
  return { bookings, totalRows, totalPages };
};

export const getProductBookingById = async (id: string) => {
  const booking = await ProductBooking.findById(id).populate(
    "user_id",
    "fullName email",
  );
  return booking;
};

export const getProductBookingsByUserId = async (
  userId: string,
  sortParams?: paramsTypes.SortParams,
  paginateParams?: paramsTypes.PaginateParams,
) => {
  const query: any = { user_id: userId, deleted: false };

  const offset = paginateParams?.offset || 0;
  const limit = paginateParams?.limit || 10;

  const sortQuery: any = {};
  if (sortParams?.sortBy) {
    sortQuery[sortParams.sortBy] =
      sortParams.sortType === paramsTypes.SORT_TYPE.ASC ? 1 : -1;
  } else {
    sortQuery.created_at = -1;
  }

  const bookings = await ProductBooking.find(query)
    .skip(offset)
    .limit(limit)
    .sort(sortQuery)
    .lean();

  const totalRows = await ProductBooking.countDocuments(query);
  const totalPages = Math.ceil(totalRows / limit);
  return { bookings, totalRows, totalPages };
};

export const updateProductBooking = async (
  id: string,
  data: UpdateProductBookingDto,
) => {
  const updated = await ProductBooking.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updated;
};

export const deleteProductBooking = async (id: string) => {
  const deleted = await ProductBooking.findByIdAndUpdate(
    id,
    { deleted: true, deleted_at: new Date() },
    { new: true },
  );
  return deleted;
};
