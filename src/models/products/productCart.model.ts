import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
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

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },

        size: {
          type: String,
          default: '',
        },

        color: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Cart = mongoose.model('Cart', cartSchema);
