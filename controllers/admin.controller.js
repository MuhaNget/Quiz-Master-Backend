const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const Question = require("../models/question.model");
const QuizAttempt = require("../models/quiz.model");

const readSetupKey = (req) =>
  req.headers["x-admin-setup-key"] || req.body.setupKey;

// POST /api/v1/admin/bootstrap
exports.bootstrapAdmin = asyncHandler(async (req, res) => {
  const setupKey = readSetupKey(req);
  if (!process.env.ADMIN_SETUP_KEY) {
    res.status(500);
    throw new Error("Admin setup key not configured");
  }
  if (!setupKey || setupKey !== process.env.ADMIN_SETUP_KEY) {
    res.status(401);
    throw new Error("Invalid admin setup key");
  }

  const adminCount = await User.countDocuments({ role: { $in: ["admin", "super_admin"] } });
  if (adminCount > 0) {
    res.status(409);
    throw new Error("Admin already exists");
  }

  const { fullname, email, password } = req.body;
  if (!fullname || !email || !password) {
    res.status(400);
    throw new Error("fullname, email, and password are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const admin = await User.create({ fullname, email, password, role: "super_admin" });
  res.status(201).json({
    message: "Admin created",
    user: {
      id: admin._id,
      fullname: admin.fullname,
      email: admin.email,
      role: admin.role,
    },
  });
});

// GET /api/v1/admin/users
exports.listUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select("-password");
  res.json(users);
});

// GET /api/v1/admin/users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// PATCH /api/v1/admin/users/:id/role
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role || !["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  if (
    req.user &&
    req.user._id.toString() === req.params.id &&
    role !== "admin"
  ) {
    res.status(400);
    throw new Error("You cannot remove your own admin role");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true },
  ).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// DELETE /api/v1/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.user && req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error("You cannot delete your own account");
  }
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ message: "User deleted" });
});

// GET /api/v1/admin/stats
exports.getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalAdmins,
    totalCategories,
    totalQuestions,
    totalQuizAttempts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    Category.countDocuments(),
    Question.countDocuments(),
    QuizAttempt.countDocuments(),
  ]);

  res.json({
    totalUsers,
    totalAdmins,
    totalCategories,
    totalQuestions,
    totalQuizAttempts,
  });
});
