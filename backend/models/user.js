const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hash karke save hoga
    role: {
      type: String,
      enum: ["customer", "agent", "admin"],
      default: "customer",
    },
  },
  { timestamps: true } // createdAt aur updatedAt apne aap ban jayega
);

module.exports = mongoose.model("User", userSchema);