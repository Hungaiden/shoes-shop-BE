import { Router } from "express";
import * as newsletterController from "../../../controllers/client/newsletter/newsletter.controller";

const router: Router = Router();

router.post("/", newsletterController.subscribe);

export const subscribeRoute: Router = router;
