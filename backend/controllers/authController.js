import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, city } = req.body;
    const allowedRoles = ["customer", "rider"];
    const userRole = allowedRoles.includes(role) ? role : "customer";
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const namePattern = /^[A-Za-z][A-Za-z\s]{2,29}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    // Validation
    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!namePattern.test(normalizedName)) {
      return res.status(400).json({
        message: "Name must be at least 3 letters and contain only letters",
      });
    }

    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars with upper, lower, number, and symbol",
      });
    }

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    // Validate rider-specific fields
    if (userRole === "rider" && (!phone || !city)) {
      return res.status(400).json({
        message: "Riders must provide phone number and city",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      phone: userRole === "rider" ? phone : undefined,
      city: userRole === "rider" ? city : undefined,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET || "freshcart_secret";

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};