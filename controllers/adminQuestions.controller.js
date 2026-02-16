const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Question = require("../models/question.model");
const Category = require("../models/category.model");

// GET /questions (grouped by category name)
exports.listQuestionsGrouped = asyncHandler(async (req, res) => {
  const search = req.query.search || "";
  const categoryId = req.query.category;
  const authorId = req.query.author;
  const timer = req.query.timer ? parseInt(req.query.timer) : null;

  let filter = {};

  // Search filter
  if (search) {
    filter.question = { $regex: search, $options: "i" };
  }

  // Category filter
  if (categoryId) {
    filter.category = new mongoose.Types.ObjectId(categoryId);
  }

  // Author filter
  if (authorId) {
    filter.author = new mongoose.Types.ObjectId(authorId);
  }

  // Timer filter
  if (timer) {
    filter.timer = timer;
  }

  const questions = await Question.find(filter)
    .populate("category", "name")
    .populate("author", "fullname email role")
    .select("+correctAnswer")
    .lean();

  const grouped = {};
  for (const q of questions) {
    const categoryName = q.category?.name || "Uncategorized";
    if (!grouped[categoryName]) grouped[categoryName] = [];
    grouped[categoryName].push({
      id: q._id,
      category: q.category,
      author: q.author
        ? {
            id: q.author._id,
            fullName: q.author.fullname,
            email: q.author.email,
            role: q.author.role,
          }
        : null,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      timer: q.timer,
      score: q.score,
      difficulty: q.difficulty,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    });
  }

  res.json(grouped);
});

// GET /questions/:id
exports.getQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findById(req.params.id)
    .populate("category", "name")
    .populate("author", "fullname email role")
    .select("+correctAnswer");
  if (!q) {
    res.status(404);
    throw new Error("Not found");
  }
  res.json({
    id: q._id,
    category: q.category,
    author: q.author
      ? {
          id: q.author._id,
          fullName: q.author.fullname,
          email: q.author.email,
          role: q.author.role,
        }
      : null,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    timer: q.timer,
    score: q.score,
    difficulty: q.difficulty,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  });
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
    point,
    difficulty,
  } = req.body;
  if (!category || !question || !options || !correctAnswer) {
    res.status(400);
    throw new Error("Missing fields");
  }
  let categoryId = category;
  if (!mongoose.Types.ObjectId.isValid(category)) {
    const foundCategory = await Category.findOne({ name: category }).select(
      "_id",
    );
    if (!foundCategory) {
      res.status(400);
      throw new Error("Invalid category");
    }
    categoryId = foundCategory._id;
  }

  let normalizedCorrectAnswer = correctAnswer;
  const parsedAnswer =
    typeof correctAnswer === "string" ? parseInt(correctAnswer, 10) : null;
  const numericAnswer =
    typeof correctAnswer === "number" ? correctAnswer : parsedAnswer;
  if (Number.isInteger(numericAnswer) && Array.isArray(options)) {
    if (numericAnswer >= 0 && numericAnswer < options.length) {
      normalizedCorrectAnswer = options[numericAnswer];
    } else if (numericAnswer >= 1 && numericAnswer <= options.length) {
      normalizedCorrectAnswer = options[numericAnswer - 1];
    }
  }

  const q = await Question.create({
    category: categoryId,
    author: req.user._id,
    question,
    options,
    correctAnswer: normalizedCorrectAnswer,
    timer,
    score: score ?? point,
    difficulty,
  });
  await Category.findByIdAndUpdate(categoryId, { $inc: { questionsCount: 1 } });
  res.status(201).json(q);
});

// PUT /questions/:id
exports.updateQuestion = asyncHandler(async (req, res) => {
  const { category, ...updateData } = req.body;
  let finalUpdateData = updateData;

  // Get the current question to check old category
  const currentQuestion = await Question.findById(req.params.id);
  if (!currentQuestion) {
    res.status(404);
    throw new Error("Not found");
  }

  // Handle category update
  if (category) {
    let categoryId = category;
    if (!mongoose.Types.ObjectId.isValid(category)) {
      const foundCategory = await Category.findOne({ name: category }).select(
        "_id",
      );
      if (!foundCategory) {
        res.status(400);
        throw new Error("Invalid category");
      }
      categoryId = foundCategory._id;
    }

    finalUpdateData.category = categoryId;

    // Update question counts if category changed
    if (currentQuestion.category.toString() !== categoryId.toString()) {
      await Category.findByIdAndUpdate(currentQuestion.category, {
        $inc: { questionsCount: -1 },
      });
      await Category.findByIdAndUpdate(categoryId, {
        $inc: { questionsCount: 1 },
      });
    }
  }

  const q = await Question.findByIdAndUpdate(req.params.id, finalUpdateData, {
    new: true,
  });

  const populated = await Question.findById(q._id)
    .populate("category", "name")
    .populate("author", "fullname email role")
    .select("+correctAnswer")
    .lean();
  res.json({
    ...populated,
    id: populated._id,
    author: populated.author
      ? {
          id: populated.author._id,
          fullName: populated.author.fullname,
          email: populated.author.email,
          role: populated.author.role,
        }
      : null,
  });
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
