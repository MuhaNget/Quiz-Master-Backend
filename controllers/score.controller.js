const asyncHandler = require("express-async-handler");
const QuizAttempt = require("../models/quiz.model");
const Category = require("../models/category.model");

// overview
exports.overview = asyncHandler(async (req, res) => {
    const userId = req.params.user_id;
    const attempts = await QuizAttempt.find({ user: userId });
    const total = attempts.length;
    const avgPerc = total
        ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / total)
        : 0;
    // best performance
    const best = attempts.sort((a, b) => b.percentage - a.percentage)[0];
    res.json({
        total_quizzes: total,
        accuracy: avgPerc,
        average_score: total
            ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / total)
            : 0,
        best_performance: best
            ? {
                  category: best.category,
                  score: best.score,
                  percentage: best.percentage,
                  date: best.takenAt,
              }
            : null,
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
