import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import upload from '../../../config/multer';

const router: Router = Router();

import * as productController from '../../../controllers/admin/products/product.controller';

router.get('/', productController.getAllProducts);

router.post(
  '/create',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  productController.createProduct,
);

router.get('/detail/:id', productController.getProductById);

router.get('/category/:category', productController.getProductsByCategory);

router.patch(
  '/update/:id',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  productController.updateProduct,
);

router.delete(
  '/deleteOne/:id',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  productController.deleteOneProduct,
);

router.post(
  '/import',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  upload.single('file'),
  productController.importProducts,
);

export const productsRoute: Router = router;
