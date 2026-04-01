import { Schema, model, Document, Types } from 'mongoose';

export interface IDiscount extends Document {
  code: string; // Mã khuyến mãi: "SUMMER2024", "NEWYEAR50", etc.
  description?: string; // Mô tả: "Sale hè 2024", etc.
  discountType: 'percentage' | 'fixed'; // Loại giảm: % hoặc số tiền cố định
  discountValue: number; // Giá trị giảm (% hoặc tiền)
  minPurchaseAmount?: number; // Giá trị mua tối thiểu để áp dụng
  maxDiscountAmount?: number; // Giảm tối đa (nếu là %)
  usageLimit?: number; // Giới hạn số lần sử dụng (null = không giới hạn)
  usageCount: number; // Số lần đã sử dụng
  validFrom: Date; // Ngày bắt đầu
  validUntil: Date; // Ngày kết thúc
  applicableCategories?: Types.ObjectId[]; // Danh mục áp dụng (null = tất cả)
  applicableProducts?: Types.ObjectId[]; // Sản phẩm áp dụng (null = tất cả)
  isActive: boolean; // Trạng thái kích hoạt
  status: 'active' | 'inactive' | 'expired' | 'archived'; // Trạng thái
  createdAt: Date;
  updatedAt: Date;
  createdBy?: Types.ObjectId; // Admin tạo
}

const discountSchema = new Schema<IDiscount>(
  {
    code: {
      type: String,
      required: [true, 'Mã khuyến mãi là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Mã phải có ít nhất 3 ký tự'],
      maxlength: [50, 'Mã không được vượt quá 50 ký tự'],
      match: [/^[A-Z0-9_-]+$/, 'Mã chỉ chứa chữ cái, số, dấu gạch ngang, gạch dưới'],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Giá trị giảm là bắt buộc'],
      min: [0, 'Giá trị giảm phải lớn hơn 0'],
      validate: [
        function (this: IDiscount) {
          if (this.discountType === 'percentage') {
            return this.discountValue <= 100;
          }
          return true;
        },
        'Giảm theo % không được vượt quá 100%',
      ],
    },
    minPurchaseAmount: {
      type: Number,
      min: [0, 'Số tiền tối thiểu phải >= 0'],
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, 'Giảm tối đa phải >= 0'],
    },
    usageLimit: {
      type: Number,
      min: [1, 'Giới hạn sử dụng phải >= 1'],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    validUntil: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
    },
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired', 'archived'],
      default: 'active',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
    },
  },
  {
    timestamps: true,
    collection: 'discounts',
  },
);

// Index for frequently queried fields
discountSchema.index({ status: 1 });
discountSchema.index({ validFrom: 1, validUntil: 1 });
discountSchema.index({ isActive: 1 });

// Middleware to auto-update status based on dates
discountSchema.pre('save', function (next) {
  const now = new Date();
  if (now > this.validUntil) {
    this.status = 'expired';
    this.isActive = false;
  } else if (now < this.validFrom) {
    this.status = 'inactive';
  } else if (this.isActive) {
    this.status = 'active';
  }
  next();
});

discountSchema.pre('findOneAndUpdate', function (next) {
  const now = new Date();
  const doc = this.getUpdate() as any;

  if (doc.validFrom || doc.validUntil || doc.isActive) {
    const validFrom = doc.validFrom || new Date();
    const validUntil = doc.validUntil || new Date();

    if (now > validUntil) {
      doc.status = 'expired';
      doc.isActive = false;
    } else if (now < validFrom) {
      doc.status = 'inactive';
    } else if (doc.isActive) {
      doc.status = 'active';
    }
  }
  next();
});

export default model<IDiscount>('Discount', discountSchema);
