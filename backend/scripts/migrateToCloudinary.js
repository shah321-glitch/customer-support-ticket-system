const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

if (process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (err) {
    // ignore
  }
}

const connectDB = require("../config/db");
const Ticket = require("../models/Ticket");
const { uploadToCloudinary } = require("../utils/cloudinary");

async function runMigration() {
  console.log("=== ResolveDesk: Cloudinary Database Migration ===");

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error("❌ ERROR: Cloudinary credentials missing in .env!");
    console.error("Please add the following to your backend/.env file:");
    console.error("  CLOUDINARY_CLOUD_NAME=your_cloud_name");
    console.error("  CLOUDINARY_API_KEY=your_api_key");
    console.error("  CLOUDINARY_API_SECRET=your_api_secret");
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI missing in .env!");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB Connected successfully.");

    // Find all tickets with base64 attachments
    const tickets = await Ticket.find({
      "attachment.url": { $regex: /^data:/ },
    });

    console.log(`Found ${tickets.length} ticket(s) with Base64 attachments in DB.`);

    if (tickets.length === 0) {
      console.log("🎉 No Base64 attachments found in database. All clean!");
      await mongoose.disconnect();
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    let totalBytesSaved = 0;

    for (const ticket of tickets) {
      const dataUrl = ticket.attachment.url;
      try {
        console.log(`Processing ticket #${ticket._id.toString().slice(-6).toUpperCase()} ("${ticket.title}")...`);
        
        // Parse data URL: data:<mimetype>;base64,<base64data>
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches || matches.length < 3) {
          console.warn(`  ⚠️ Could not parse Base64 for ticket #${ticket._id}, skipping.`);
          failedCount++;
          continue;
        }

        const mimetype = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");
        const filename = ticket.attachment.originalname || ticket.attachment.filename || "migrated_file";

        // Upload buffer to Cloudinary
        const result = await uploadToCloudinary(buffer, filename, "resolvedesk_tickets");

        // Calculate size in KB
        const base64SizeKB = Math.round(dataUrl.length / 1024);
        totalBytesSaved += dataUrl.length;

        // Update ticket in database
        ticket.attachment.url = result.url;
        ticket.attachment.public_id = result.public_id;
        ticket.attachment.size = result.bytes;
        ticket.attachment.mimetype = mimetype;
        await ticket.save();

        successCount++;
        console.log(`  ✅ Uploaded to Cloudinary: ${result.url}`);
        console.log(`  Purged ~${base64SizeKB} KB Base64 data from MongoDB document!`);
      } catch (err) {
        failedCount++;
        console.error(`  ❌ Failed to migrate ticket #${ticket._id}:`, err.message);
      }
    }

    const totalSavedMB = (totalBytesSaved / (1024 * 1024)).toFixed(2);
    console.log("\n================ MIGRATION REPORT ================");
    console.log(`Total Base64 tickets processed: ${tickets.length}`);
    console.log(`Successfully migrated to Cloudinary: ${successCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Total Database Space Saved: ~${totalSavedMB} MB`);
    console.log("==================================================");

    await mongoose.disconnect();
    console.log("MongoDB connection closed. Migration finished.");
  } catch (err) {
    console.error("Migration fatal error:", err);
    process.exit(1);
  }
}

runMigration();

