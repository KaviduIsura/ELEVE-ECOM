import Order from "../models/Order.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Revenue
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // 2. Total Orders
    const totalOrders = await Order.countDocuments();

    // 3. Total Customers
    const totalCustomers = await User.countDocuments({ type: "customer" });

    // 4. Conversion Rate (approximation)
    let conversionRate = 0;
    if (totalCustomers > 0) {
      conversionRate = ((totalOrders / (totalCustomers * 10)) * 100).toFixed(1); 
    }

    // 5. Recent Orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId shippingInfo total status createdAt paymentMethod');

    // 6. Top Products
    const topProducts = await Order.aggregate([
      { $unwind: "$orderedItems" },
      {
        $group: {
          _id: "$orderedItems.productId",
          name: { $first: "$orderedItems.name" },
          image: { $first: "$orderedItems.image" },
          totalSold: { $sum: "$orderedItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderedItems.price", "$orderedItems.quantity"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        conversionRate,
        recentOrders,
        topProducts
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard statistics" });
  }
};
