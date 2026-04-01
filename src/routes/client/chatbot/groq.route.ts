import express from "express";
import { Router } from "express";
import { recommendProduct } from "../../../controllers/client/products/groq.controller";

const router: Router = Router();

router.post("/recommend-product", recommendProduct);

export const GroqRoute: Router = router;
