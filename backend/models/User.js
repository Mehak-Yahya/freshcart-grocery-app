import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    role: {
      type: String,
      enum: ["customer", "admin", "rider"],
      default: "customer",
    },

    phone: {
      type: String,
      sparse: true,
    },

    city: {
      type: String,
      sparse: true,
    },

    // Rider fields
    isAvailable: {
      type: Boolean,
      default: false,
    },

    vehicleType: {
      type: String,
      enum: ["bike", "car", "van"],
      sparse: true,
    },

    vehicleNumber: {
      type: String,
      sparse: true,
    },

    cnic: {
      type: String,
      sparse: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    todayEarnings: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    completedDeliveries: {
      type: Number,
      default: 0,
    },
// PASSWORD RESET FIELDS
resetToken: {
  type: String,
},
resetTokenExpire: {
  type: Date,
},
    currentLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
