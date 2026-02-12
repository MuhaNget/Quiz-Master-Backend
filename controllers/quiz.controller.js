const asyncHandler = require("express-async-handler");
const Question = require("../models/question.model");
const QuizAttempt = require("../models/quiz.model");
const Category = require("../models/category.model");
const mongoose = require("mongoose");

// GET /api/v1/quizzes/start?category_id=...
exports.startQuiz = asyncHandler(async (req, res) => {
  const { category_id } = req.query;
  if (!category_id) {
    res.status(400);
    throw new Error("category_id required");
  }
  const category = await Category.findById(category_id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  // pick 10 random questions
  const pipeline = [
    { $match: { category: new mongoose.Types.ObjectId(category_id) } },
    { $sample: { size: 10 } },
    {
      $project: {
        question: 1,
        options: 1,
        correctAnswer: 1,
        timer: 1,
        score: 1,
      },
    },
  ];
  const questions = await Question.aggregate(pipeline);
  res.json({ category: category.name, questions });
});

// POST /api/v1/quizzes/submit
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { category_id, answers } = req.body;
  if (!category_id || !Array.isArray(answers)) {
    res.status(400);
    throw new Error("Invalid payload");
  }
  // compute score
  let score = 0,
    correct = 0,
    wrong = 0,
    totalScores = 0;
  const detailed = [];
  for (const a of answers) {
    const q = await Question.findById(a.question_id).select("+correctAnswer");
    if (!q) continue;
    totalScores += q.score;

    // Handle both index and string correctAnswer
    let correctAnswerText = q.correctAnswer;
    const numericIndex = parseInt(q.correctAnswer, 10);
    if (!isNaN(numericIndex) && q.options[numericIndex] !== undefined) {
      correctAnswerText = q.options[numericIndex];
    }

    const isCorrect = correctAnswerText === a.selected_option;
    if (isCorrect) {
      score += q.score;
      correct++;
    } else {
      wrong++;
    }
    detailed.push({
      question: q._id,
      selectedOption: a.selected_option,
      isCorrect,
    });
  }
  const percentage =
    totalScores > 0 ? Math.round((score / totalScores) * 100) : 0;
  const attempt = await QuizAttempt.create({
    user: req.user._id,
    category: category_id,
    questions: detailed,
    score,
    percentage,
    correctAnswers: correct,
    wrongAnswers: wrong,
  });
  // update user aggregates
  const User = require("../models/user.model");
  const user = await User.findById(req.user._id);

  // Calculate streak (increments only once per day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActiveDate = user.lastActive
    ? new Date(user.lastActive)
    : new Date(0);
  lastActiveDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));

  let newStreak = user.streak || 0;
  if (daysDiff === 0) {
    // Already did a quiz today, don't increment
    newStreak = user.streak || 0;
  } else if (daysDiff === 1) {
    // Did a quiz yesterday, increment
    newStreak = (user.streak || 0) + 1;
  } else {
    // More than 1 day gap or new user, reset to 1
    newStreak = 1;
  }

  // Update longestStreak if current streak is higher
  const newLongestStreak = Math.max(user.longestStreak || 0, newStreak);

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { totalPoints: score, totalQuizzes: 1 },
    streak: newStreak,
    longestStreak: newLongestStreak,
    lastActive: new Date(),
  });

  // Generate dynamic comment based on percentage
  let comment = "Good job!";
  if (percentage >= 90) {
    comment = "Outstanding! Perfect performance!";
  } else if (percentage >= 80) {
    comment = "Excellent work!";
  } else if (percentage >= 70) {
    comment = "Good job!";
  } else if (percentage >= 60) {
    comment = "Not bad! Keep practicing.";
  } else {
    comment = "Keep learning and try again!";
  }

  res.json({
    score: `${score}`,
    percentage,
    correct_answers: correct,
    wrong_answers: wrong,
    comment,
  });
});
