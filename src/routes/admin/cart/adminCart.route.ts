import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import * as adminCartController from '../../../controllers/admin/cart/adminCart.controller';

const router: Router = Router();

router.use(authMiddleware.isAuthorized, authMiddleware.hasRoles('admin'));

// GET /admin-carts — Lấy danh sách tất cả giỏ hàng
router.get('/', adminCartController.getAllCarts);

// GET /admin-carts/:userId — Lấy giỏ hàng của 1 user
router.get('/:userId', adminCartController.getCartByUser);

// DELETE /admin-carts/:userId/clear — Xoá toàn bộ giỏ hàng của user
router.delete('/:userId/clear', adminCartController.clearUserCart);

// DELETE /admin-carts/:userId/item/:itemId — Xoá 1 item
router.delete('/:userId/item/:itemId', adminCartController.removeUserCartItem);

export const adminCartRoute: Router = router;
