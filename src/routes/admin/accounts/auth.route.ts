import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
const router: Router = Router();

import * as authController from '../../../controllers/admin/accounts/auth.controller';

router.post('/login', authController.login);

router.post('/admin/login', authController.adminLogin);

router.post('/logout', authController.logout);

router.patch('/refresh-token', authController.refreshToken);

export const authsRoute: Router = router;
