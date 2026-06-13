import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();


// GET PROFILE
router.get("/profile", protect, authorizeRoles("customer"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// UPDATE PROFILE
router.put("/profile", protect, authorizeRoles("customer"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.city = req.body.city || user.city;

    await user.save();

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});


// CHANGE PASSWORD
router.put("/change-password", protect, authorizeRoles("customer"), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password" });
  }
});

export default router;