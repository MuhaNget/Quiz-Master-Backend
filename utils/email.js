const nodemailer = require("nodemailer");

module.exports = async function sendEmail(to, subject, text) {
  // Minimal scaffold - configure with env vars
  console.log("Email config:", {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    passLength: process.env.EMAIL_PASS?.length,
  });
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    return true;
  } catch (err) {
    console.warn("Email send failed (scaffold):", err.message);
    return false;
  }
};
