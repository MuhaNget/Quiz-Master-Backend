const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const QuizAttempt = require("../models/quiz.model");

// GET stats
exports.getStats = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const data = {
    total_quizzes: user.totalQuizzes || 0,
    total_points: user.totalPoints || 0,
    streak: user.streak || 0,
    longest_streak: user.longestStreak || 0,
  };
  res.json(data);
});

// activities
exports.activities = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const acts = await QuizAttempt.find({ user: userId })
    .sort({ takenAt: -1 })
    .limit(20)
    .populate("category", "name");
  const formatted = acts.map((a) => ({
    category: a.category.name,
    score: a.score,
    percentage: a.percentage,
    takenAt: a.takenAt,
  }));
  res.json(formatted);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullname, fullName, email } = req.body;
  const updates = {};
  if (fullname || fullName) updates.fullname = fullname || fullName;
  if (email) updates.email = email;
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  }).select("-password");
  res.json(user);
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const ok = await user.matchPassword(oldPassword);
  if (!ok) {
    res.status(400);
    throw new Error("Old password incorrect");
  }
  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  const userIdToDelete = req.params.id;
  const requestingUser = req.user;

  // Check if user is deleting their own account OR is a super admin
  const isOwnAccount = requestingUser._id.toString() === userIdToDelete;
  const isSuperAdmin = requestingUser.role === "superAdmin";

  if (!isOwnAccount && !isSuperAdmin) {
    res.status(403);
    throw new Error("You can only delete your own account");
  }

  await User.findByIdAndDelete(userIdToDelete);
  res.json({ message: "Account deleted" });
});
