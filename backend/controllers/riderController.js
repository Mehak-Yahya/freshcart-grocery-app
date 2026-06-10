import User from "../models/User.js";
import Order from "../models/Order.js";

// Get all riders
export const getRiders = async (req, res) => {
  try {
    const riders = await User.find({ role: "rider" }).select(
      "name email phone city role createdAt"
    );

    res.json({
      message: "Riders retrieved successfully",
      riders,
    });
  } catch (error) {
    console.error("Get riders error:", error);
    res.status(500).json({
      message: error.message || "Failed to retrieve riders",
    });
  }
};

// Assign order to rider
export const assignOrderToRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedRider } = req.body;

    if (!assignedRider) {
      return res.status(400).json({
        message: "Rider ID is required",
      });
    }

    // Verify rider exists
    const rider = await User.findOne({ _id: assignedRider, role: "rider" });
    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    // Update order with assigned rider
   const order = await Order.findByIdAndUpdate(
  id,
  { assignedRider, status: "processing" },
  { returnDocument: "after", runValidators: true }
)
  .populate("user", "name email phone")
  .populate("assignedRider", "name phone")
  .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order assigned to rider successfully",
      order,
    });
  } catch (error) {
    console.error("Assign order error:", error);
    res.status(500).json({
      message: error.message || "Failed to assign order",
    });
  }
};

// Get rider's deliveries
export const getRiderDeliveries = async (req, res) => {
  try {
    const riderId = req.user._id;

    const deliveries = await Order.find({ assignedRider: riderId })
      .populate("user", "name email phone")
      .populate("assignedRider", "name phone")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      message: "Deliveries retrieved successfully",
      deliveries,
    });
  } catch (error) {
    console.error("Get deliveries error:", error);
    res.status(500).json({
      message: error.message || "Failed to retrieve deliveries",
    });
  }
};

// Update delivery status (by rider)
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const riderId = req.user._id;

    // Validate status
    const validStatuses = ["pending", "processing", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid delivery status",
      });
    }

    // Verify order is assigned to this rider
    const order = await Order.findOne({ _id: id, assignedRider: riderId });
    if (!order) {
      return res.status(404).json({
        message: "Delivery not found or not assigned to you",
      });
    }

    // Update status
const updatedOrder = await Order.findByIdAndUpdate(
  id,
  { status },
  { returnDocument: "after", runValidators: true }
)
  .populate("user", "name email phone")
  .populate("assignedRider", "name phone")
  .populate("items.product");

    res.json({
      message: "Delivery status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update delivery error:", error);
    res.status(500).json({
      message: error.message || "Failed to update delivery status",
    });
  }
};


// Toggle availability
export const toggleAvailability = async (req, res) => {
  try {
    const riderId = req.user._id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "isAvailable must be a boolean value",
      });
    }

    const rider = await User.findByIdAndUpdate(
  riderId,
  { isAvailable },
  { returnDocument: "after" }
).select("name email isAvailable role");

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    res.json({
      message: `Rider is now ${isAvailable ? "online" : "offline"}`,
      rider,
    });
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({
      message: error.message || "Failed to update availability",
    });
  }
};

// Get delivery history
export const getDeliveryHistory = async (req, res) => {
  try {
    const riderId = req.user._id;
    const { startDate, endDate, status } = req.query;

    let query = { assignedRider: riderId };

    // Filter by date if provided
    if (startDate || endDate) {
      query.updatedAt = {};
      if (startDate) {
        query.updatedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.updatedAt.$lte = new Date(endDate);
      }
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const history = await Order.find(query)
      .populate("user", "name email phone address")
      .populate("items.product", "name price image")
      .sort({ updatedAt: -1 })
      .limit(100);

    res.json({
      message: "Delivery history retrieved successfully",
      history,
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      message: error.message || "Failed to retrieve history",
    });
  }
};

// Update rider profile
export const updateRiderProfile = async (req, res) => {
  try {
    const riderId = req.user._id;
    const { name, phone, vehicleType, vehicleNumber, cnic } = req.body;

    const allowedFields = {
      name,
      phone,
      vehicleType,
      vehicleNumber,
      cnic,
    };

    // Remove undefined fields
    Object.keys(allowedFields).forEach(
      (key) => allowedFields[key] === undefined && delete allowedFields[key]
    );

   const rider = await User.findByIdAndUpdate(riderId, allowedFields, {
  returnDocument: "after",
  runValidators: true,
}).select("-password");

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      rider,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: error.message || "Failed to update profile",
    });
  }
};

// Get rider profile
export const getRiderProfile = async (req, res) => {
  try {
    const riderId = req.user._id;

    const rider = await User.findById(riderId).select("-password");

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    res.json({
      message: "Profile retrieved successfully",
      rider,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      message: error.message || "Failed to retrieve profile",
    });
  }
};

// Submit support ticket
export const submitSupportTicket = async (req, res) => {
  try {
    const riderId = req.user._id;
    const { type, subject, message, orderId } = req.body;

    if (!type || !subject || !message) {
      return res.status(400).json({
        message: "Type, subject, and message are required",
      });
    }

    // In a real app, save to a SupportTicket collection
    // For now, we'll just return a confirmation
    res.json({
      message: "Support ticket submitted successfully",
      ticket: {
        _id: new Date().getTime(),
        riderId,
        type,
        subject,
        message,
        orderId: orderId || null,
        status: "open",
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Submit ticket error:", error);
    res.status(500).json({
      message: error.message || "Failed to submit support ticket",
    });
  }
};

// Update current location
export const updateLocation = async (req, res) => {
  try {
    const riderId = req.user._id;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const rider = await User.findByIdAndUpdate(
  riderId,
  {
    currentLocation: {
      latitude,
      longitude,
      updatedAt: new Date(),
    },
  },
  { returnDocument: "after" }
).select("name email currentLocation");

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    res.json({
      message: "Location updated successfully",
      rider,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({
      message: error.message || "Failed to update location",
    });
  }
};


// 🇵🇰 Get rider earnings (REALISTIC PAKISTAN MODEL - FINAL)
export const getRiderEarnings = async (req, res) => {
  try {
    const riderId = req.user._id;

    const rider = await User.findById(riderId).select(
      "name todayEarnings totalEarnings completedDeliveries"
    );

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch deliveries
    const todayDeliveries = await Order.find({
      assignedRider: riderId,
      status: "delivered",
      updatedAt: { $gte: today, $lt: tomorrow },
    }).populate("items.product");

    const weekDeliveries = await Order.find({
      assignedRider: riderId,
      status: "delivered",
      updatedAt: { $gte: weekAgo },
    });

    const monthDeliveries = await Order.find({
      assignedRider: riderId,
      status: "delivered",
      updatedAt: { $gte: monthAgo },
    });

    // ===============================
    // 🇵🇰 REALISTIC EARNINGS ENGINE
    // ===============================
    const BASE_PAY = 150;

    const calculateEarnings = (orders) => {
      let total = 0;
      let breakdown = [];

      orders.forEach((order) => {
        const orderValue = order.totalPrice || 0;

        let bonus = 0;

        // delivery bonus (Pakistan realistic model)
        if (orderValue > 5000) bonus = 50;
        else if (orderValue > 3000) bonus = 30;
        else if (orderValue > 1000) bonus = 20;

        const earning = BASE_PAY + bonus;

        total += earning;

        breakdown.push({
          orderId: order._id,
          basePay: BASE_PAY,
          bonus,
          totalEarning: earning,
          orderValue,
          items: order.items?.length || 0,
        });
      });

      return { total, breakdown };
    };

    const todayData = calculateEarnings(todayDeliveries);
    const weekData = calculateEarnings(weekDeliveries);
    const monthData = calculateEarnings(monthDeliveries);

    // ===============================
    // BONUS SYSTEM (REALISTIC)
    // ===============================
    const todayBonus =
      todayDeliveries.length >= 10
        ? todayDeliveries.length * 15
        : todayDeliveries.length >= 5
        ? todayDeliveries.length * 5
        : 0;

    const finalToday = todayData.total + todayBonus;

    res.json({
      message: "Earnings retrieved successfully",

      earnings: {
        today: finalToday,
        week: weekData.total,
        month: monthData.total,

        // ⚠️ IMPORTANT FIX (real system)
        total: rider.totalEarnings + finalToday || finalToday,

        deliveries: {
          today: todayDeliveries.length,
          thisWeek: weekDeliveries.length,
          thisMonth: monthDeliveries.length,
          completed: rider.completedDeliveries || 0,
        },

        todayBreakdown: {
          baseEarnings: todayData.total,
          bonus: todayBonus,
          total: finalToday,
          reason:
            todayBonus > 0
              ? `Bonus applied for ${todayDeliveries.length} deliveries`
              : "No bonus (need 5+ deliveries)",
        },

        productBreakdown: {
          today: todayData.breakdown,
          recentDeliveries: todayDeliveries.slice(0, 10).map((order) => ({
            orderId: order._id,
            earnings: 100,
            items: order.items?.length || 0,
            orderValue: order.totalPrice || 0,
          })),
        },

        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Get earnings error:", error);
    res.status(500).json({
      message: error.message || "Failed to retrieve earnings",
    });
  }
};