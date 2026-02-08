const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const generateToken = require("../utils/jwt");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

// POST /api/v1/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { fullname, email, password, confirm_password } = req.body;
  if (!fullname || !email || !password || !confirm_password) {
    res.status(400);
    throw new Error("All fields are required");
  }
  if (password !== confirm_password) {
    res.status(400);
    throw new Error("Passwords do not match");
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }
  const user = await User.create({ fullname, email, password });
  res.status(201).json({
    message: "Registration successful",
    user: {
      id: user._id,
      fullname: user.fullname,
      fullName: user.fullname,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  const matched = await user.matchPassword(password);
  if (!matched) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  const token = generateToken(user._id);
  res.json({
    token,
    accessToken: token,
    user: {
      id: user._id,
      fullname: user.fullname,
      fullName: user.fullname,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/v1/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user with that email");
  }
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  // send email (scaffold)
  await sendEmail(
    email,
    "Password reset",
    `Use this token to reset your password: ${resetToken}`,
  );
  res.json({ message: "Reset token sent to email" });
});

// POST /api/v1/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password, confirm_password } = req.body;
  if (password !== confirm_password) {
    res.status(400);
    throw new Error("Passwords do not match");
  }
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: "Password reset successful" });
});
