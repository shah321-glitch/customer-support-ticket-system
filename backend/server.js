const express = require("express");
const cors = require("cors");
const path = require("path");

const fs = require("fs");

// Load .env from backend folder or root folder
require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./config/db");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connect karna
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Customer Support Ticket System API is running 🚀" });
});

// Routes link karna
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.get("/api/stats", require("./middleware/auth").protect, require("./controllers/ticketControllers").getStats);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Vercel deployment ke liye export karna zaroori hai
module.exports = app;

// Local server start karna
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
