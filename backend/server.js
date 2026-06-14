import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Load .env manually - bypass dotenvx
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.join(__dirname, ".env");

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    if (line.trim() && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
  console.log("✅ .env loaded from:", envPath);
  console.log("  Variables loaded:", Object.keys(process.env).filter(k => !k.startsWith("npm_")).length);
}

import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import riderRoutes from "./routes/riderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.get("/", (req, res) => {
  res.send("FreshCart Backend Running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/riders", riderRoutes);
app.use("/api/rider", riderRoutes);
app.use("/api/customer", customerRoutes);

const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI && process.env.MONGO_URI !== "your_connection_string"
    ? process.env.MONGO_URI
    : "mongodb://127.0.0.1:27017/freshcart";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@freshcart.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

const ensureDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Default admin account created");
  }
};

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    await ensureDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();