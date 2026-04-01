import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { hasPurchased } from '../../../middlewares/product.middleware';
import * as productReviewController from '../../../controllers/client/products/productReview.controller';

const router: Router = Router();

// GET /products/reviews/:productId - Lấy danh sách đánh giá approved của sản phẩm (public)
router.get('/:productId', productReviewController.getReviewsByProduct);

// POST /products/reviews - Tạo đánh giá (chỉ user đã mua)
router.post('/', authMiddleware.isAuthorized, hasPurchased, productReviewController.createReview);

// PATCH /products/reviews/:id - Cập nhật đánh giá của user
router.patch('/:id', authMiddleware.isAuthorized, productReviewController.updateReview);

// DELETE /products/reviews/:id - Xóa đánh giá của user
router.delete('/:id', authMiddleware.isAuthorized, productReviewController.deleteReview);

export const clientProductReviewRoute: Router = router;
