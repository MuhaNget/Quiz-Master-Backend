const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const Question = require("../models/question.model");
const QuizAttempt = require("../models/quiz.model");
const Category = require("../models/category.model");
const Review = require("../models/review.model");

const formatDate = (d) => d.toISOString().slice(0, 10);

// GET /analytics/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalReviews, totalQuestions, totalAttempts] =
    await Promise.all([
      User.countDocuments(),
      Review.countDocuments(),
      Question.countDocuments(),
      QuizAttempt.countDocuments(),
    ]);

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 6);

  const usersByDay = await User.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const userGrowthMap = new Map(usersByDay.map((d) => [d._id, d.count]));
  const userGrowth = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = formatDate(day);
    userGrowth.push({ date: key, count: userGrowthMap.get(key) || 0 });
  }

  const popularCategoriesAgg = await QuizAttempt.aggregate([
    { $group: { _id: "$category", plays: { $sum: 1 } } },
    { $sort: { plays: -1 } },
    { $limit: 5 },
  ]);

  const categoryIds = popularCategoriesAgg.map((c) => c._id);
  const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
  const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

  const popularCategories = popularCategoriesAgg.map((c) => ({
    name: categoryMap.get(c._id.toString())?.name || "Unknown",
    plays: c.plays,
  }));

  const recentAttempts = await QuizAttempt.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("user", "fullname email")
    .populate("category", "name");

  const recentActivity = recentAttempts.map((a) => ({
    id: a._id,
    user: a.user?.fullname || a.user?.email || "Unknown",
    action: `Completed quiz in ${a.category?.name || "Unknown"}`,
    timestamp: a.createdAt,
  }));

  res.json({
    totalUsers,
    totalReviews,
    totalQuestions,
    totalAttempts,
    userGrowth,
    popularCategories,
    recentActivity,
  });
});
