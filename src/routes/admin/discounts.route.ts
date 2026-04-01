import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import * as discountController from '../../controllers/admin/discounts/discount.controller';

const router: Router = Router();

router.get('/active-program', discountController.getActiveDiscountProgram);

router.get(
  '/',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  discountController.getAllDiscounts,
);
router.get(
  '/:id',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  discountController.getDiscount,
);
router.post(
  '/',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  discountController.createDiscount,
);
router.put(
  '/:id',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  discountController.updateDiscount,
);
router.delete(
  '/:id',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  discountController.deleteDiscount,
);
router.post('/validate', authMiddleware.isAuthorized, discountController.validateDiscountCode);
router.post(
  '/:discountId/increment-usage',
  authMiddleware.isAuthorized,
  discountController.incrementDiscountUsage,
);

export default router;
