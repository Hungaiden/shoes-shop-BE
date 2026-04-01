import { Cart } from '../../../models/products/productCart.model';
import { Account } from '../../../models/accounts/account.model';

const USER_SELECT = 'fullName email avatar';

const attachUserInfo = async <T extends { user_id?: any }>(carts: T[]) => {
  const userIds = Array.from(
    new Set(
      carts
        .map((cart) => cart.user_id)
        .filter((id) => !!id)
        .map((id) => id.toString()),
    ),
  );

  if (userIds.length === 0) {
    return carts.map((cart) => ({ ...cart, user_id: cart.user_id ?? null }));
  }

  const users = await Account.find({ _id: { $in: userIds } })
    .select(USER_SELECT)
    .lean();

  const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

  return carts.map((cart) => {
    const rawUserId = cart.user_id?.toString?.() || '';
    if (!rawUserId) {
      return { ...cart, user_id: null };
    }

    const user = userMap.get(rawUserId);
    return {
      ...cart,
      user_id: user || rawUserId,
    };
  });
};

// Lấy tất cả giỏ hàng (có phân trang + tìm kiếm)
export const getAllCarts = async (params: {
  offset?: number;
  limit?: number;
  keyword?: string;
}) => {
  const { offset = 0, limit = 10, keyword } = params;

  // Lấy tất cả carts và populate product
  const allCartsRaw = await Cart.find()
    .populate('items.product_id', 'name price discount thumbnail')
    .lean();

  const allCarts = await attachUserInfo(allCartsRaw as any[]);

  // Lọc theo keyword (email hoặc fullName)
  let filtered = allCarts;
  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = allCarts.filter((cart: any) => {
      const user = cart.user_id as any;
      if (!user || typeof user !== 'object') return false;
      return user.email?.toLowerCase().includes(kw) || user.fullName?.toLowerCase().includes(kw);
    });
  }

  const totalRows = filtered.length;
  const totalPages = Math.ceil(totalRows / limit);
  const safeOffset = offset > totalRows ? 0 : offset;
  const paginated = filtered.slice(safeOffset, safeOffset + limit);

  return { carts: paginated, totalRows, totalPages };
};

// Lấy giỏ hàng của 1 user cụ thể
export const getCartByUserId = async (userId: string) => {
  const cart = await Cart.findOne({ user_id: userId })
    .populate('items.product_id', 'name price discount thumbnail sizes colors')
    .lean();

  if (!cart) {
    return { user_id: userId, items: [] };
  }

  const [normalized] = await attachUserInfo([cart as any]);
  return normalized;
};

// Xoá toàn bộ giỏ hàng của 1 user
export const clearCartByUserId = async (userId: string) => {
  const cart = await Cart.findOneAndUpdate({ user_id: userId }, { items: [] }, { new: true });

  if (!cart) {
    throw new Error('Giỏ hàng không tồn tại!');
  }

  return cart;
};

// Xoá 1 item khỏi giỏ hàng của user
export const removeItemFromCart = async (userId: string, itemId: string) => {
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    throw new Error('Giỏ hàng không tồn tại!');
  }

  const initialLength = cart.items.length;
  cart.items.pull({ _id: itemId });

  if (cart.items.length === initialLength) {
    throw new Error('Sản phẩm không tồn tại trong giỏ hàng!');
  }

  await cart.save();

  const updated = await Cart.findById(cart._id)
    .populate('items.product_id', 'name price discount thumbnail sizes colors')
    .lean();

  if (!updated) {
    throw new Error('Giỏ hàng không tồn tại!');
  }

  const [normalized] = await attachUserInfo([updated as any]);
  return normalized;
};
