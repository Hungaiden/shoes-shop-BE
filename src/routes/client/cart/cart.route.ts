import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import * as cartController from "../../../controllers/client/cart/cart.controller";

const router: Router = Router();

// Tất cả cart routes đều yêu cầu đăng nhập
router.use(authMiddleware.isAuthorized);

// GET /cart — Lấy giỏ hàng của user hiện tại
router.get("/", cartController.getCart);

// POST /cart/add — Thêm sản phẩm vào giỏ
router.post("/add", cartController.addToCart);

// PATCH /cart/update/:itemId — Cập nhật item (số lượng, size, màu)
router.patch("/update/:itemId", cartController.updateCartItem);

// DELETE /cart/remove/:itemId — Xoá một sản phẩm khỏi giỏ
router.delete("/remove/:itemId", cartController.removeCartItem);

// DELETE /cart/clear — Xoá toàn bộ giỏ hàng
router.delete("/clear", cartController.clearCart);

export const cartRoute: Router = router;
