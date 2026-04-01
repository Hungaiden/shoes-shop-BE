import { Request, Response } from "express";
import Product from "../../../models/products/product.model";
import { getProductRecommendations } from "../../../services/client/products/groq.service";

export const recommendProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userInput = req.body;

    // Lấy toàn bộ sản phẩm còn hoạt động từ DB (schema dùng deletedAt, không dùng deleted)
    const allProducts = await Product.find({
      deletedAt: null,
      status: "active",
    })
      .populate("category", "title")
      .lean();

    console.log("[Recommend] available products count:", allProducts.length);

    // Gọi Groq để lấy sản phẩm phù hợp
    const recommendedProductIds = await getProductRecommendations(
      userInput,
      allProducts,
    );

    const normalizedProductIds = recommendedProductIds
      .map((id) => String(id).trim())
      .filter(Boolean);

    console.log("[Recommend] ai product ids:", normalizedProductIds);

    if (
      !Array.isArray(normalizedProductIds) ||
      normalizedProductIds.length === 0
    ) {
      res.status(200).json({ products: [] });
      return;
    }

    // Truy vấn DB lấy chi tiết sản phẩm theo id
    const matchedProducts = await Product.find({
      _id: { $in: normalizedProductIds },
      deletedAt: null,
      status: "active",
    }).populate("category", "title");

    console.log("[Recommend] matched products count:", matchedProducts.length);

    res.status(200).json({ products: matchedProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
