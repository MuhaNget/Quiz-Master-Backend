const asyncHandler = require("express-async-handler");
const QuizAttempt = require("../models/quiz.model");
const Category = require("../models/category.model");

// overview
exports.overview = asyncHandler(async (req, res) => {
  const userId = req.params.user_id;
  const attempts = await QuizAttempt.find({ user: userId })
    .populate("category", "name icon")
    .populate("questions.question", "score");
  const total = attempts.length;
  const avgPerc = total
    ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / total)
    : 0;

  // best performance
  const best = attempts.sort((a, b) => b.percentage - a.percentage)[0];

  // Group attempts by category
  const categoryMap = {};
  attempts.forEach((attempt) => {
    const categoryId = attempt.category._id.toString();
    if (!categoryMap[categoryId]) {
      categoryMap[categoryId] = {
        categoryId: attempt.category._id,
        categoryName: attempt.category.name,
        icon: attempt.category.icon,
        attempts: [],
      };
    }
    categoryMap[categoryId].attempts.push(attempt);
  });

  // Calculate stats for each category
  const categories = Object.values(categoryMap).map((cat) => {
    const categoryAttempts = cat.attempts;
    const categoryTotal = categoryAttempts.length;
    const accuracy = categoryTotal
      ? Math.round(
          categoryAttempts.reduce((s, a) => s + a.percentage, 0) /
            categoryTotal,
        )
      : 0;
    const bestScore = categoryTotal
      ? Math.max(...categoryAttempts.map((a) => a.percentage))
      : 0;
    const averageScore = categoryTotal
      ? Math.round(
          categoryAttempts.reduce((s, a) => s + a.score, 0) / categoryTotal,
        )
      : 0;

    return {
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      icon: cat.icon,
      totalQuizzes: categoryTotal,
      accuracy,
      bestScore,
      averageScore,
    };
  });

  res.json({
    total_quizzes: total,
    accuracy: avgPerc,
    average_score: total
      ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / total)
      : 0,
    best_performance: best
      ? {
          category: best.category.name,
          score: best.score,
          totalScore: best.questions.reduce(
            (sum, q) => sum + (q.question?.score || 0),
            0,
          ),
          percentage: best.percentage,
          date: best.takenAt,
        }
      : null,
    categories,
  });
});

// history paginated
exports.history = asyncHandler(async (req, res) => {
  const userId = req.params.user_id;
  const page = parseInt(req.query.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;
  const total = await QuizAttempt.countDocuments({ user: userId });
  const items = await QuizAttempt.find({ user: userId })
    .sort({ takenAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("category", "name");
  res.json({ page, total, items });
});
