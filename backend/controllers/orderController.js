import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, phone, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one item",
      });
    }

    // Validate delivery address
    if (!deliveryAddress || !deliveryAddress.address || !deliveryAddress.city) {
      return res.status(400).json({
        message: "Please provide complete delivery address",
      });
    }

    // Validate phone
    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    // Create order
    const order = await Order.create({
      user: userId,
      items: items.map((item) => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      deliveryAddress,
      phone,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
    });

    // Populate user and product details
    await order.populate("user", "name email");
    await order.populate("items.product");

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      message: error.message || "Failed to create order",
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      message: error.message || "Failed to retrieve orders",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate("user", "name email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      message: error.message || "Failed to retrieve order",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "processing", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

const order = await Order.findByIdAndUpdate(
  id,
  { status },
  { returnDocument: "after", runValidators: true }
)
      .populate("user", "name email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      message: error.message || "Failed to update order status",
    });
  }
};
