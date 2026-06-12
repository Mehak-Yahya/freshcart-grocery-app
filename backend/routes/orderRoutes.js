import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer routes
router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);

// Admin routes
router.put("/:id", protect, authorizeRoles("admin"), updateOrderStatus);

export default router;
