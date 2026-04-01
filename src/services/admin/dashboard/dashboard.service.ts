import { ProductBooking } from "../../../models/products/productBooking.model";
import Product from "../../../models/products/product.model";
import { Account } from "../../../models/accounts/account.model";

export const getDashboardSummary = async () => {
  try {
    const [revenueResult, bookingStats, productStats, totalAccounts] =
      await Promise.all([
        // Calculate total revenue
        ProductBooking.aggregate([
          {
            $match: {
              deleted: false,
              $or: [{ payment_status: "paid" }, { status: "delivered" }],
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total_price" },
            },
          },
        ]),

        // Get booking statistics
        ProductBooking.aggregate([
          {
            $match: {
              deleted: false,
            },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

        // Get product statistics
        Product.aggregate([
          {
            $match: {
              deletedAt: null,
            },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),

        // Total accounts
        Account.countDocuments({ deleted: false }),
      ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const bookingStatsMap = bookingStats.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalBooking = {
      total: bookingStats.reduce((sum, curr) => sum + curr.count, 0),
      pending: bookingStatsMap["pending"] || 0,
      confirmed: bookingStatsMap["confirmed"] || 0,
      shipping: bookingStatsMap["shipping"] || 0,
      delivered: bookingStatsMap["delivered"] || 0,
      completed: bookingStatsMap["delivered"] || 0,
      cancelled: bookingStatsMap["cancelled"] || 0,
    };

    const productStatsMap = productStats.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalProduct = {
      total: productStats.reduce((sum, curr) => sum + curr.count, 0),
      active: productStatsMap["active"] || 0,
      inactive: productStatsMap["inactive"] || 0,
      out_of_stock: productStatsMap["out_of_stock"] || 0,
    };

    return {
      totalRevenue,
      totalBooking,
      totalProduct,
      totalAccounts,
    };
  } catch (error) {
    throw new Error("Error getting dashboard summary");
  }
};
