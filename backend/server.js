const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Load .env from backend folder or root folder
require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./config/db");

// Ensure uploads directory exists (use /tmp/uploads in serverless if needed)
const uploadsDir = process.env.VERCEL ? "/tmp/uploads" : path.join(__dirname, "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn("Uploads directory creation skipped:", e.message);
}

const app = express();

// Disable ETags to prevent 304 Not Modified responses
app.set("etag", false);

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    maxAge: 86400, // Caches CORS preflight (204) in browser for 24h to eliminate repeated OPTIONS overhead
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Prevent 304 conditional cache for API routes so fresh 200 data is always returned
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// Test Root Route
app.get("/", (req, res) => {
  res.json({ message: "Customer Support Ticket System API is running 🚀" });
});

// Diagnostic Health Route
app.get("/api/health", (req, res) => {
  const hasMongoUri = Boolean(process.env.MONGO_URI);
  const maskedUri = hasMongoUri
    ? process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@")
    : "NOT SET";
  const hasJwt = Boolean(process.env.JWT_SECRET);
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"][
    mongoose.connection.readyState
  ] || "unknown";

  res.json({
    status: "ok",
    hasMongoUri,
    maskedUri,
    hasJwt,
    dbState,
    isVercel: Boolean(process.env.VERCEL),
    nodeEnv: process.env.NODE_ENV || "development",
  });
});

// Middleware: Ensure MongoDB is connected before handling any API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error.message);
    return res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Routes link karna
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.get(
  "/api/stats",
  require("./middleware/auth").protect,
  require("./controllers/ticketControllers").getStats
);

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
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
