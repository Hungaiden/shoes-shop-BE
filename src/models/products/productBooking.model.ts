import mongoose from 'mongoose';

const productBookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        thumbnail: {
          type: String,
          default: '',
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discount: {
          type: Number,
          default: 0,
        },
        size: {
          type: String,
          default: '',
        },
        color: {
          type: String,
          default: '',
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    contact_info: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, default: '' },
    },

    note: {
      type: String,
      default: '',
    },

    total_price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
      default: null,
    },

    discount_code: {
      type: String,
      default: '',
    },

    discount_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Trạng thái đơn hàng
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },

    // Trạng thái thanh toán
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    payment_method: {
      type: String,
      enum: ['vnpay', 'momo', 'cash', 'bank_transfer'],
      default: 'vnpay',
    },

    transaction_code: {
      type: String,
    },

    payment_time: {
      type: Date,
    },

    vnp_response_code: {
      type: String,
    },

    payment_url: {
      type: String,
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
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

export const ProductBooking = mongoose.model(
  'ProductBooking',
  productBookingSchema,
  'product_bookings',
);
