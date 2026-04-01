import { Router } from 'express';
import upload from '../../config/multer';
import { authMiddleware } from '../../middlewares/auth.middleware';
const router: Router = Router();

import * as uploadController from '../../controllers/admin/upload.controller';

router.use(authMiddleware.isAuthorized, authMiddleware.hasRoles('admin'));

// Upload single file
router.post('/single', upload.single('image'), uploadController.uploadSingle);

// Upload multiple files
router.post(
  '/multiple',
  upload.array('images', 5), // Giới hạn 5 file
  uploadController.uploadMultiple,
);

export default router;
