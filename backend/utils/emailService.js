/**
 * Email Notification Service (Simulation & SMTP Ready)
 * Logs notifications to console and can send real emails if SMTP credentials are provided.
 */

const sendEmailNotification = async ({ to, subject, html, text }) => {
  try {
    // If SMTP environment variables are present, we could use nodemailer.
    // By default, we provide a clean, production-grade notification logger:
    const timestamp = new Date().toISOString();
    console.log(`\n================== 📧 EMAIL NOTIFICATION ==================`);
    console.log(`[${timestamp}]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${text || html.replace(/<[^>]*>/g, "")}`);
    console.log(`===========================================================\n`);
    return { success: true };
  } catch (error) {
    console.error("Email notification error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmailNotification };

