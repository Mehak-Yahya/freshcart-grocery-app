import express from "express";
import {
  getRiders,
  assignOrderToRider,
  getRiderDeliveries,
  updateDeliveryStatus,
  getRiderEarnings,
  toggleAvailability,
  getDeliveryHistory,
  updateRiderProfile,
  getRiderProfile,
  submitSupportTicket,
  updateLocation,
} from "../controllers/riderController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin - Get all riders
router.get("/", protect, authorizeRoles("admin"), getRiders);

// Admin - Assign order to rider
router.put("/orders/:id/assign", protect, authorizeRoles("admin"), assignOrderToRider);

// Rider - Get assigned deliveries
router.get("/deliveries", protect, authorizeRoles("rider"), getRiderDeliveries);

// Rider - Update delivery status
router.put("/deliveries/:id", protect, authorizeRoles("rider"), updateDeliveryStatus);

// Rider - Get earnings
router.get("/earnings", protect, authorizeRoles("rider"), getRiderEarnings);

// Rider - Toggle availability
router.put("/availability", protect, authorizeRoles("rider"), toggleAvailability);

// Rider - Get delivery history
router.get("/history", protect, authorizeRoles("rider"), getDeliveryHistory);

// Rider - Get profile
router.get("/profile", protect, authorizeRoles("rider"), getRiderProfile);

// Rider - Update profile
router.put("/profile", protect, authorizeRoles("rider"), updateRiderProfile);

// Rider - Update location
router.put("/location", protect, authorizeRoles("rider"), updateLocation);

// Rider - Submit support ticket
router.post("/support", protect, authorizeRoles("rider"), submitSupportTicket);

export default router;
