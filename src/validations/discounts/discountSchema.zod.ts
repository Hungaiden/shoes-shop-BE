import { z } from 'zod';

export const createDiscountSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_-]+$/),
  description: z.string().max(500).optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0).max(100),
  minPurchaseAmount: z.number().min(0).optional().default(0),
  maxDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateDiscountSchema = createDiscountSchema.partial();

export type CreateDiscountDTO = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountDTO = z.infer<typeof updateDiscountSchema>;
