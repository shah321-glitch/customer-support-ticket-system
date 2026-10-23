const mongoose = require("mongoose");
const dns = require("dns");

// Windows/Node.js c-ares DNS SRV lookup fix for MongoDB Atlas
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  // Agar pehle se connected hai, toh naya connection mat banao
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Database Connected!");
  } catch (error) {
    console.error("\n❌ MongoDB Database Connection Error!");
    console.error("👉 Reason: Aapka current IP address MongoDB Atlas me Whitelist nahi hai.");
    console.error("👉 Fix: MongoDB Atlas me jayein -> 'Network Access' -> '+ ADD IP ADDRESS' -> 'Allow Access From Anywhere (0.0.0.0/0)' karein.\n");
  }
};

module.exports = connectDB;
