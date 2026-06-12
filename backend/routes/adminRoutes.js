import express from "express";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { getAdminOrders, getAdminStats,getAdminUsers} from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", protect, authorizeRoles("admin"), getAdminStats);
router.get("/orders", protect, authorizeRoles("admin"), getAdminOrders);
router.get("/users", protect, authorizeRoles("admin"), getAdminUsers);

export default router;