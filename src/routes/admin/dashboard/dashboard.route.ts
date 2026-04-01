import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import * as dashboardController from '../../../controllers/admin/dashboard/dashboard.controller';

const router: Router = Router();

router.get(
  '/summary',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  dashboardController.getDashboardSummary,
);

export const dashboardRoute: Router = router;
