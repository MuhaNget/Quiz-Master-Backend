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

  // Category performance stats
  const categoryAttemptsAgg = await QuizAttempt.aggregate([
    { $group: { _id: "$category", totalAttempts: { $sum: 1 } } },
  ]);

  const categoryQuestionsAgg = await Question.aggregate([
    { $group: { _id: "$category", totalQuestions: { $sum: 1 } } },
  ]);

  const categoryStats = {};
  categoryAttemptsAgg.forEach((c) => {
    const catId = c._id.toString();
    categoryStats[catId] = { totalAttempts: c.totalAttempts, totalQuestions: 0 };
  });

  categoryQuestionsAgg.forEach((c) => {
    const catId = c._id.toString();
    if (categoryStats[catId]) {
      categoryStats[catId].totalQuestions = c.totalQuestions;
    } else {
      categoryStats[catId] = { totalAttempts: 0, totalQuestions: c.totalQuestions };
    }
  });

  res.json({
    totalUsers,
    totalReviews,
    totalQuestions,
    totalAttempts,
    userGrowth,
    popularCategories,
    recentActivity,
    categoryStats,
  });
});

// GET /analytics/category-performance
exports.getCategoryPerformance = asyncHandler(async (req, res) => {
  // Get all categories with their attempt counts
  const categoryAttemptsAgg = await QuizAttempt.aggregate([
    { $group: { _id: "$category", totalAttempts: { $sum: 1 } } },
  ]);

  // Get all categories with their question counts
  const categoryQuestionsAgg = await Question.aggregate([
    { $group: { _id: "$category", totalQuestions: { $sum: 1 } } },
  ]);

  // Get all category details
  const allCategories = await Category.find().lean();
  
  // Build a map for easy lookup
  const attemptsMap = new Map(
    categoryAttemptsAgg.map((c) => [c._id.toString(), c.totalAttempts])
  );
  const questionsMap = new Map(
    categoryQuestionsAgg.map((c) => [c._id.toString(), c.totalQuestions])
  );

  // Build the response
  const categoryPerformance = allCategories.map((category) => {
    const catId = category._id.toString();
    const totalAttempts = attemptsMap.get(catId) || 0;
    const totalQuestions = questionsMap.get(catId) || 0;
    const avgAttemptsPerQuestion = totalQuestions > 0 
      ? Number((totalAttempts / totalQuestions).toFixed(2))
      : 0;

    return {
      categoryId: catId,
      categoryName: category.name,
      totalQuestions,
      totalAttempts,
      avgAttemptsPerQuestion,
    };
  });

  res.json({ categoryPerformance });
});
