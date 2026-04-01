import express from 'express';
import { Router } from 'express';
import {
  createSystemSetting,
  getSystemSetting,
  updateSystemSetting,
} from '../../../controllers/systemSetting.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = express.Router();

router.use(authMiddleware.isAuthorized, authMiddleware.hasRoles('admin'));

router.post('/', createSystemSetting);

router.get('/', getSystemSetting);

router.patch('/', updateSystemSetting);

export const systemSettingsRoute: Router = router;
