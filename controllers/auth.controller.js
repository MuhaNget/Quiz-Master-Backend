const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const generateToken = require("../utils/jwt");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

// POST /api/v1/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { fullname, fullName, email, password, confirm_password } = req.body;
  const name = fullname || fullName;
  if (!name || !email || !password || !confirm_password) {
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
  const user = await User.create({ fullname: name, email, password });
  res.status(201).json({
    message: "Registration successful",
    user: {
      id: user._id,
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
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  // send email (scaffold)
  await sendEmail(
    email,
    "Password Reset PIN",
    `Your password reset PIN is: ${resetToken}\n\nThis PIN will expire in 1 hour.`,
  );
  res.json({ message: "Reset PIN sent to email" });
});

// POST /api/v1/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password, confirm_password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error("Token and password are required");
  }

  if (password !== confirm_password) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const user = await User.findOne({
    resetPasswordToken: token.toString(),
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password");

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
