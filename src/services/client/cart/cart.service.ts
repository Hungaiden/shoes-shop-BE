import { Cart } from "../../../models/products/productCart.model";
import Product from "../../../models/products/product.model";

const CART_PRODUCT_SELECT = "name price thumbnail images stock status";

// Lấy giỏ hàng của người dùng
export const getCart = async (userId: string) => {
  const cart = await Cart.findOne({ user_id: userId })
    .populate("items.product_id", CART_PRODUCT_SELECT)
    .lean();

  if (!cart) {
    return { user_id: userId, items: [] };
  }

  return cart;
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number,
  size: string,
  color: string,
) => {
  const product = await Product.findOne({ _id: productId, deletedAt: null });
  if (!product) {
    throw new Error("Sản phẩm không tồn tại!");
  }

  let cart = await Cart.findOne({ user_id: userId });

  if (!cart) {
    cart = new Cart({ user_id: userId, items: [] });
  }

  // Kiểm tra sản phẩm đã tồn tại trong giỏ chưa (cùng product_id, size, color)
  const existingIndex = cart.items.findIndex(
    (item: any) =>
      item.product_id.toString() === productId &&
      item.size === (size || "") &&
      item.color === (color || ""),
  );

  if (existingIndex >= 0) {
    // Cộng thêm số lượng
    cart.items[existingIndex].quantity += quantity || 1;
  } else {
    cart.items.push({
      product_id: productId as any,
      quantity: quantity || 1,
      size: size || "",
      color: color || "",
    });
  }

  await cart.save();

  return await Cart.findById(cart._id)
    .populate("items.product_id", CART_PRODUCT_SELECT)
    .lean();
};

// Cập nhật số lượng / thuộc tính của một item trong giỏ
export const updateCartItem = async (
  userId: string,
  itemId: string,
  updates: { quantity?: number; size?: string; color?: string },
) => {
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    throw new Error("Giỏ hàng không tồn tại!");
  }

  const item = cart.items.find((i: any) => i._id.toString() === itemId);
  if (!item) {
    throw new Error("Sản phẩm không tồn tại trong giỏ hàng!");
  }

  if (updates.quantity !== undefined) {
    if (updates.quantity < 1) throw new Error("Số lượng phải lớn hơn 0!");
    item.quantity = updates.quantity;
  }
  if (updates.size !== undefined) item.size = updates.size;
  if (updates.color !== undefined) item.color = updates.color;

  await cart.save();

  return await Cart.findById(cart._id)
    .populate("items.product_id", CART_PRODUCT_SELECT)
    .lean();
};

// Xoá một sản phẩm khỏi giỏ hàng
export const removeCartItem = async (userId: string, itemId: string) => {
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    throw new Error("Giỏ hàng không tồn tại!");
  }

  const initialLength = cart.items.length;
  cart.items.pull({ _id: itemId });

  if (cart.items.length === initialLength) {
    throw new Error("Sản phẩm không tồn tại trong giỏ hàng!");
  }

  await cart.save();

  return await Cart.findById(cart._id)
    .populate("items.product_id", CART_PRODUCT_SELECT)
    .lean();
};

// Xoá toàn bộ giỏ hàng
export const clearCart = async (userId: string) => {
  const cart = await Cart.findOneAndUpdate(
    { user_id: userId },
    { items: [] },
    { new: true },
  );

  if (!cart) {
    throw new Error("Giỏ hàng không tồn tại!");
  }

  return cart;
};
