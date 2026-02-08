const asyncHandler = require("express-async-handler");
const Question = require("../models/question.model");
const Category = require("../models/category.model");

// GET /questions (grouped by category name)
exports.listQuestionsGrouped = asyncHandler(async (req, res) => {
  const questions = await Question.find()
    .populate("category", "name")
    .select("+correctAnswer")
    .lean();

  const grouped = {};
  for (const q of questions) {
    const categoryName = q.category?.name || "Uncategorized";
    if (!grouped[categoryName]) grouped[categoryName] = [];
    grouped[categoryName].push({
      id: q._id,
      category: q.category,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      timer: q.timer,
      score: q.score,
      difficulty: q.difficulty,
    });
  }

  res.json(grouped);
});

// GET /questions/:id
exports.getQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findById(req.params.id)
    .populate("category", "name")
    .select("+correctAnswer");
  if (!q) {
    res.status(404);
    throw new Error("Not found");
  }
  res.json(q);
});

// POST /questions
exports.createQuestion = asyncHandler(async (req, res) => {
  const {
    category,
    question,
    options,
    correctAnswer,
    timer,
    score,
    difficulty,
  } = req.body;
  if (!category || !question || !options || !correctAnswer) {
    res.status(400);
    throw new Error("Missing fields");
  }
  const q = await Question.create({
    category,
    question,
    options,
    correctAnswer,
    timer,
    score,
    difficulty,
  });
  await Category.findByIdAndUpdate(category, { $inc: { questionsCount: 1 } });
  res.status(201).json(q);
});

// PUT /questions/:id
exports.updateQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!q) {
    res.status(404);
    throw new Error("Not found");
  }
  res.json(q);
});

// DELETE /questions/:id
exports.deleteQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findByIdAndDelete(req.params.id);
  if (!q) {
    res.status(404);
    throw new Error("Not found");
  }
  await Category.findByIdAndUpdate(q.category, {
    $inc: { questionsCount: -1 },
  });
  res.json({ success: true });
});
