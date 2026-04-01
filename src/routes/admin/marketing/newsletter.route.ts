import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import * as newsletterController from '../../../controllers/admin/marketing/newsletter.controller';

const router: Router = Router();

router.get(
  '/subscribers',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  newsletterController.getSubscribers,
);
router.patch(
  '/subscribers/:id/status',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  newsletterController.updateSubscriberStatus,
);

router.get(
  '/campaigns',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  newsletterController.getCampaigns,
);
router.post(
  '/campaigns',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  newsletterController.createCampaign,
);
router.post(
  '/campaigns/:id/send',
  authMiddleware.isAuthorized,
  authMiddleware.hasRoles('admin'),
  newsletterController.sendCampaign,
);

export const newsletterRoute: Router = router;
