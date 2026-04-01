import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    }, // % giảm giá
    images: {
      type: [String],
      default: [],
    }, // Mảng URL ảnh sản phẩm
    thumbnail: {
      type: String,
      default: "",
    }, // Ảnh đại diện (ảnh đầu tiên)
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    sizes: {
      type: [String],
      default: [],
    }, // ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    colors: {
      type: [String],
      default: [],
    }, // ['Black', 'White', 'Blue', ...]
    material: {
      type: String,
      default: "",
    }, // Chất liệu: Cotton, Polyester, ...
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    }, // Số lượng tồn kho
    sold: {
      type: Number,
      default: 0,
    }, // Số lượng đã bán
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    }, // Điểm đánh giá trung bình
    reviewCount: {
      type: Number,
      default: 0,
    }, // Số lượng đánh giá
    isFeatured: {
      type: Boolean,
      default: false,
    }, // Sản phẩm nổi bật
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },
    deletedAt: {
      type: Date,
      default: null,
    }, // Soft delete
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// Text search index
productSchema.index({ name: "text", description: "text", brand: "text" });

// Tự tạo thumbnail từ ảnh đầu tiên nếu chưa có
productSchema.pre("save", function (next) {
  if (!this.thumbnail && this.images && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
