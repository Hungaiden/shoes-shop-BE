import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductBooking",
      default: null,
    }, // Tham chiếu đơn hàng (để xác minh đã mua)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxLength: [1000, "Nội dung đánh giá không được vượt quá 1000 ký tự"],
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    size: {
      type: String,
      default: "",
    }, // Size đã mua
    color: {
      type: String,
      default: "",
    }, // Màu đã mua
    is_approved: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

// Ngăn 1 user review cùng 1 sản phẩm nhiều lần
productReviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

export const ProductReview = mongoose.model(
  "ProductReview",
  productReviewSchema,
  "product_reviews",
);
