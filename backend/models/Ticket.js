const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ["customer", "agent", "admin"], default: "customer" },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["General", "Billing", "Technical", "Account", "Feature Request"],
      default: "General",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Low",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    attachment: {
      filename: String,
      originalname: String,
      mimetype: String,
      size: Number,
      url: String,
    },
    comments: [commentSchema],
    feedback: feedbackSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
