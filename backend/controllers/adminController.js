import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getAdminStats = async (req, res) => {
  try {
    const [userCount, productCount, inventoryAggregate, pendingOrders, orderCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Product.aggregate([{ $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }]),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments(),
    ]);

    res.status(200).json({
      stats: {
        userCount,
        productCount,
        inventoryCount: inventoryAggregate[0]?.totalQuantity || 0,
        pendingOrders,
        orderCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email role")
      .populate("items.product", "name imageUrl category")
      .populate("assignedRider", "name phone city role")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};