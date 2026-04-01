import mongoose from 'mongoose';
import { ProductReview } from '../../../models/products/productReview.model';
import Product from '../../../models/products/product.model';
import type { CreateProductReviewDto } from '../../../dto/products/create.productReview.dto';
import * as paramsTypes from '../../../utils/types/paramsTypes';

const recalculateProductRating = async (productId: string) => {
  const result = await ProductReview.aggregate([
    {
      $match: {
        product_id: new mongoose.Types.ObjectId(productId),
        deleted: false,
        is_approved: true,
      },
    },
    {
      $group: {
        _id: '$product_id',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = result.length > 0 ? result[0].averageRating : 0;
  const reviewCount = result.length > 0 ? result[0].reviewCount : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(averageRating * 10) / 10,
    reviewCount,
  });
};

export const createProductReview = async (data: CreateProductReviewDto) => {
  const newReview = await ProductReview.create(data);
  await recalculateProductRating(data.product_id);
  return newReview;
};

export const updateProductReview = async (id: string, data: Partial<CreateProductReviewDto>) => {
  const review = await ProductReview.findByIdAndUpdate(id, data, { new: true });
  if (review) {
    await recalculateProductRating(review.product_id.toString());
  }
  return review;
};

export const approveProductReview = async (id: string) => {
  const review = await ProductReview.findByIdAndUpdate(id, { is_approved: true }, { new: true });
  if (review) {
    await recalculateProductRating(review.product_id.toString());
  }
  return review;
};

export const deleteProductReview = async (id: string) => {
  const review = await ProductReview.findByIdAndUpdate(
    id,
    { deleted: true, deleted_at: new Date() },
    { new: true },
  );
  if (review) {
    await recalculateProductRating(review.product_id.toString());
  }
  return review;
};

export const getAllProductReviews = async (
  searchParams?: paramsTypes.SearchParams,
  sortParams?: paramsTypes.SortParams,
  paginateParams?: paramsTypes.PaginateParams,
) => {
  const query: any = { deleted: false };
  if (searchParams?.keyword && searchParams?.field) {
    query[searchParams.field] = { $regex: searchParams.keyword, $options: 'i' };
  }

  const offset = paginateParams?.offset || 0;
  const limit = paginateParams?.limit || 10;

  const sortQuery: any = {};
  if (sortParams?.sortBy) {
    sortQuery[sortParams.sortBy] = sortParams.sortType === paramsTypes.SORT_TYPE.ASC ? 1 : -1;
  } else {
    sortQuery.created_at = -1;
  }

  const reviews = await ProductReview.find(query)
    .populate({ path: 'product_id', select: 'name sku' })
    .populate({ path: 'user_id', select: 'fullName email' })
    .skip(offset)
    .limit(limit)
    .sort(sortQuery)
    .lean();

  const totalRows = await ProductReview.countDocuments(query);
  const totalPages = Math.ceil(totalRows / limit);
  return { reviews, totalRows, totalPages };
};

export const getProductReviewsByProductId = async (
  productId: string,
  sortParams?: paramsTypes.SortParams,
  paginateParams?: paramsTypes.PaginateParams,
) => {
  const query: any = { product_id: productId, deleted: false, is_approved: true };

  const offset = paginateParams?.offset || 0;
  const limit = paginateParams?.limit || 10;

  const sortQuery: any = {};
  if (sortParams?.sortBy) {
    sortQuery[sortParams.sortBy] = sortParams.sortType === paramsTypes.SORT_TYPE.ASC ? 1 : -1;
  } else {
    sortQuery.created_at = -1;
  }

  const reviews = await ProductReview.find(query)
    .populate({ path: 'user_id', select: 'fullName avatar' })
    .skip(offset)
    .limit(limit)
    .sort(sortQuery)
    .lean();

  const totalRows = await ProductReview.countDocuments(query);
  const totalPages = Math.ceil(totalRows / limit);
  return { reviews, totalRows, totalPages };
};

export const getReviewById = async (id: string) => {
  const review = await ProductReview.findById(id);
  return review;
};

export const checkExistingReview = async (productId: string, userId: string) => {
  const review = await ProductReview.findOne({
    product_id: new mongoose.Types.ObjectId(productId),
    user_id: new mongoose.Types.ObjectId(userId),
    deleted: false,
  });
  return review;
};
