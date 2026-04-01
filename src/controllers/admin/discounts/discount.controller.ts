import { Request, Response } from 'express';
import Discount from '../../../models/marketing/discount.model';
import {
  createDiscountSchema,
  updateDiscountSchema,
} from '../../../validations/discounts/discountSchema.zod';
import { ZodError } from 'zod';

// Get all discounts
export const getAllDiscounts = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0, status, isActive, keyword } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (keyword) {
      filter.$or = [
        { code: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    const total = await Discount.countDocuments(filter);
    const discounts = await Discount.find(filter)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: -1 });

    res.json({
      hits: discounts,
      pagination: {
        totalRows: total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ message: 'Lỗi khi tải khuyến mãi' });
  }
};

// Get current active discount program (public)
export const getActiveDiscountProgram = async (_req: Request, res: Response) => {
  try {
    const now = new Date();

    const activeProgram = await Discount.findOne({
      isActive: true,
      status: 'active',
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    })
      .sort({ validUntil: 1, createdAt: -1 })
      .lean();

    if (!activeProgram) {
      res.json({ hit: null });
      return;
    }

    res.json({ hit: activeProgram });
  } catch (error) {
    console.error('Error fetching active discount program:', error);
    res.status(500).json({ message: 'Lỗi khi tải chương trình khuyến mãi' });
  }
};

// Get single discount
export const getDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findById(id)
      .populate('applicableCategories')
      .populate('applicableProducts');

    if (!discount) {
      res.status(404).json({ message: 'Khuyến mãi không tồn tại' });
      return;
    }

    res.json(discount);
  } catch (error) {
    console.error('Error fetching discount:', error);
    res.status(500).json({ message: 'Lỗi khi tải khuyến mãi' });
  }
};

// Create discount
export const createDiscount = async (req: Request, res: Response) => {
  try {
    const validated = createDiscountSchema.parse(req.body);

    // Check if code already exists
    const existing = await Discount.findOne({ code: validated.code.toUpperCase() });
    if (existing) {
      res.status(400).json({ message: 'Mã khuyến mãi đã tồn tại' });
      return;
    }

    // Validate dates
    if (new Date(validated.validFrom) >= new Date(validated.validUntil)) {
      res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
      return;
    }

    const discount = new Discount({
      ...validated,
      code: validated.code.toUpperCase(),
      createdBy: (req as any).user?.id,
    });

    await discount.save();

    res.status(201).json(discount);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors,
      });
      return;
    }
    console.error('Error creating discount:', error);
    res.status(500).json({ message: 'Lỗi khi tạo khuyến mãi' });
  }
};

// Update discount
export const updateDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = updateDiscountSchema.parse(req.body);

    // Check if code already exists (if changing code)
    if (validated.code) {
      const existing = await Discount.findOne({
        code: validated.code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        res.status(400).json({ message: 'Mã khuyến mãi đã tồn tại' });
        return;
      }
      validated.code = validated.code.toUpperCase();
    }

    // Validate dates if provided
    if (validated.validFrom && validated.validUntil) {
      if (new Date(validated.validFrom) >= new Date(validated.validUntil)) {
        res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
        return;
      }
    }

    const discount = await Discount.findByIdAndUpdate(id, validated, { new: true });

    if (!discount) {
      res.status(404).json({ message: 'Khuyến mãi không tồn tại' });
      return;
    }

    res.json(discount);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors,
      });
      return;
    }
    console.error('Error updating discount:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật khuyến mãi' });
  }
};

// Delete discount (soft delete)
export const deleteDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findByIdAndUpdate(
      id,
      { status: 'archived', isActive: false },
      { new: true },
    );

    if (!discount) {
      res.status(404).json({ message: 'Khuyến mãi không tồn tại' });
      return;
    }

    res.json({ message: 'Khuyến mãi đã bị xóa' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({ message: 'Lỗi khi xóa khuyến mãi' });
  }
};

// Validate discount code (for client-side)
export const validateDiscountCode = async (req: Request, res: Response) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code) {
      res.status(400).json({ message: 'Vui lòng cung cấp mã khuyến mãi' });
      return;
    }

    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
      status: 'active',
    });

    if (!discount) {
      res.status(404).json({ message: 'Mã khuyến mãi không tồn tại hoặc đã hết hạn' });
      return;
    }

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      res.status(400).json({ message: 'Mã khuyến mãi đã hết lượt sử dụng' });
      return;
    }

    // Check minimum purchase
    if (discount.minPurchaseAmount && totalAmount < discount.minPurchaseAmount) {
      res.status(400).json({
        message: `Đơn hàng phải tối thiểu ${discount.minPurchaseAmount.toLocaleString('vi-VN')}₫ để sử dụng mã này`,
      });
      return;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discountType === 'percentage') {
      discountAmount = Math.round((totalAmount * discount.discountValue) / 100);
      if (discount.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
      }
    } else {
      discountAmount = discount.discountValue;
    }

    res.json({
      discountId: discount._id,
      code: discount.code,
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      discountAmount,
      minPurchaseAmount: discount.minPurchaseAmount,
      maxDiscountAmount: discount.maxDiscountAmount,
      remainingUses: discount.usageLimit ? discount.usageLimit - discount.usageCount : null,
    });
  } catch (error) {
    console.error('Error validating discount:', error);
    res.status(500).json({ message: 'Lỗi khi kiểm tra khuyến mãi' });
  }
};

// Increase usage count
export const incrementDiscountUsage = async (req: Request, res: Response) => {
  try {
    const discountId = req.params.discountId || req.body.discountId;

    if (!discountId) {
      res.status(400).json({ message: 'Thiếu discountId' });
      return;
    }

    const discount = await Discount.findByIdAndUpdate(
      discountId,
      { $inc: { usageCount: 1 } },
      { new: true },
    );

    if (!discount) {
      res.status(404).json({ message: 'Khuyến mãi không tồn tại' });
      return;
    }

    res.json(discount);
  } catch (error) {
    console.error('Error incrementing discount usage:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật lượt sử dụng' });
  }
};
