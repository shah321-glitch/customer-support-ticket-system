const mongoose = require("mongoose");
const dns = require("dns");

// Windows/Node.js c-ares DNS SRV lookup fix for MongoDB Atlas on local development
if (!process.env.VERCEL && process.env.NODE_ENV !== "production" && process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (err) {
    console.warn("DNS server override skipped:", err.message);
  }
}

let cachedConnection = null;

const connectDB = async () => {
  // 1. Agar pehle se connected hai, toh naya connection mat banao
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. MONGO_URI missing check
  if (!process.env.MONGO_URI) {
    const errorMsg =
      "CRITICAL: MONGO_URI is missing in Environment Variables! Please add MONGO_URI in Vercel Project Settings -> Environment Variables.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 3. Agar connecting state me hai, existing promise reuse karo
  if (cachedConnection && mongoose.connection.readyState === 2) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Prevents 10s buffering timeout error
      serverSelectionTimeoutMS: 8000,
    });
    console.log("MongoDB Database Connected!");
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    console.error("\n❌ MongoDB Database Connection Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
