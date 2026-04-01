import * as XLSX from "xlsx";
import Product from "../../../models/products/product.model";

export interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}

const parseMultiValue = (val: unknown): string[] => {
  if (!val) return [];
  return String(val)
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseBool = (val: unknown): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string")
    return val.trim().toLowerCase() === "true" || val.trim() === "1";
  if (typeof val === "number") return val === 1;
  return false;
};

export const importProductsFromBuffer = async (
  buffer: Buffer,
): Promise<ImportResult> => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames.includes("Product")
    ? "Product"
    : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });

  const result: ImportResult = { success: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNum = i + 2;

    try {
      const name = String(raw["name"] ?? "").trim();
      if (!name) {
        result.failed++;
        result.errors.push({ row: rowNum, message: "Thiếu tên sản phẩm" });
        continue;
      }

      const price = Number(raw["price"]);
      if (isNaN(price) || price < 0) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          message: `Giá không hợp lệ: ${raw["price"]}`,
        });
        continue;
      }

      const stock = Number(raw["stock"]);
      if (isNaN(stock) || stock < 0) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          message: `Tồn kho không hợp lệ: ${raw["stock"]}`,
        });
        continue;
      }

      const sku = String(raw["sku"] ?? "").trim() || undefined;
      if (sku) {
        const existing = await Product.findOne({ sku });
        if (existing) {
          result.failed++;
          result.errors.push({
            row: rowNum,
            message: `SKU "${sku}" đã tồn tại`,
          });
          continue;
        }
      }

      const productData: Record<string, unknown> = { name, price, stock };

      if (raw["slug"]) productData.slug = String(raw["slug"]).trim();
      if (sku) productData.sku = sku;
      if (raw["description"])
        productData.description = String(raw["description"]).trim();
      if (raw["discount"] !== "")
        productData.discount = Number(raw["discount"]) || 0;
      if (raw["thumbnail"])
        productData.thumbnail = String(raw["thumbnail"]).trim();
      if (raw["brand"]) productData.brand = String(raw["brand"]).trim();
      if (raw["category"])
        productData.category = String(raw["category"]).trim();
      if (raw["material"])
        productData.material = String(raw["material"]).trim();
      if (raw["sold"] !== "") productData.sold = Number(raw["sold"]) || 0;
      if (raw["rating"] !== "")
        productData.rating = Number(raw["rating"]) || 0;
      if (raw["reviewCount"] !== "")
        productData.reviewCount = Number(raw["reviewCount"]) || 0;
      if (raw["isFeatured"] !== "")
        productData.isFeatured = parseBool(raw["isFeatured"]);

      const status = String(raw["status"] ?? "").trim();
      productData.status = ["active", "inactive", "out_of_stock"].includes(
        status,
      )
        ? status
        : "active";

      const images = parseMultiValue(raw["images"]);
      if (images.length) productData.images = images;
      const sizes = parseMultiValue(raw["sizes"]);
      if (sizes.length) productData.sizes = sizes;
      const colors = parseMultiValue(raw["colors"]);
      if (colors.length) productData.colors = colors;

      await new Product(productData).save();
      result.success++;
    } catch (err: any) {
      result.failed++;
      result.errors.push({
        row: rowNum,
        message: err.message ?? "Lỗi không xác định",
      });
    }
  }

  return result;
};
