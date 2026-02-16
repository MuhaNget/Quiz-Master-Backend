const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const Question = require("../models/question.model");
const Category = require("../models/category.model");

// POST /search (global search)
exports.globalSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim().length < 2) {
    res.status(400);
    throw new Error("Search query must be at least 2 characters");
  }

  const searchRegex = { $regex: query, $options: "i" };

  // Search users (non-admins)
  const users = await User.find({
    role: "user",
    $or: [{ fullname: searchRegex }, { email: searchRegex }],
  })
    .select("fullname email totalPoints")
    .limit(5)
    .lean();

  // Search admins
  const admins = await User.find({
    role: { $in: ["admin", "super_admin"] },
    $or: [{ fullname: searchRegex }, { email: searchRegex }],
  })
    .select("fullname email role")
    .limit(5)
    .lean();

  // Search questions
  const questions = await Question.find({
    question: searchRegex,
  })
    .populate("category", "name")
    .select("question category difficulty")
    .limit(5)
    .lean();

  // Search categories
  const categories = await Category.find({
    name: searchRegex,
  })
    .select("name icon questionsCount")
    .limit(5)
    .lean();

  res.json({
    query,
    results: {
      users: users.map((u) => ({
        id: u._id,
        type: "user",
        name: u.fullname,
        email: u.email,
        points: u.totalPoints,
      })),
      admins: admins.map((a) => ({
        id: a._id,
        type: "admin",
        name: a.fullname,
        email: a.email,
        role: a.role,
      })),
      questions: questions.map((q) => ({
        id: q._id,
        type: "question",
        text: q.question,
        category: q.category?.name,
        difficulty: q.difficulty,
      })),
      categories: categories.map((c) => ({
        id: c._id,
        type: "category",
        name: c.name,
        icon: c.icon,
        questionsCount: c.questionsCount,
      })),
    },
    totalResults:
      users.length + admins.length + questions.length + categories.length,
  });
});
