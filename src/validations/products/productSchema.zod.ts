import { z } from "zod";

const ProductStatusEnum = z.enum(["active", "inactive", "out_of_stock"]);

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),

  sku: z.string().optional(),

  description: z.string().optional(),

  price: z
    .number({ required_error: "Price is required" })
    .min(0, "Price must be non-negative"),

  discount: z.number().min(0).max(100).optional().default(0),

  images: z
    .array(z.string().url({ message: "Each image must be a valid URL" }))
    .optional()
    .default([]),

  thumbnail: z.string().optional(),

  brand: z.string().optional(),

  category: z.string().optional(),

  sizes: z.array(z.string()).optional().default([]),

  colors: z.array(z.string()).optional().default([]),

  material: z.string().optional(),

  stock: z
    .number({ required_error: "Stock is required" })
    .int()
    .min(0, "Stock must be non-negative"),

  isFeatured: z.boolean().optional().default(false),

  status: ProductStatusEnum.optional().default("active"),
});

export const UpdateProductSchema = z.object({
  _id: z.string().min(1, "ID is required"),

  name: z.string().min(1).optional(),

  sku: z.string().optional(),

  description: z.string().optional(),

  price: z.number().min(0).optional(),

  discount: z.number().min(0).max(100).optional(),

  images: z
    .array(z.string().url({ message: "Each image must be a valid URL" }))
    .optional(),

  thumbnail: z.string().optional(),

  brand: z.string().optional(),

  category: z.string().optional(),

  sizes: z.array(z.string()).optional(),

  colors: z.array(z.string()).optional(),

  material: z.string().optional(),

  stock: z.number().int().min(0).optional(),

  isFeatured: z.boolean().optional(),

  status: ProductStatusEnum.optional(),
});
