const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Question = require("../models/question.model");
const Category = require("../models/category.model");

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
  // increment category count
  await Category.findByIdAndUpdate(categoryId, { $inc: { questionsCount: 1 } });
  res.status(201).json(q);
});

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

  res.json(q);
});

exports.deleteQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findByIdAndDelete(req.params.id);
  if (!q) {
    res.status(404);
    throw new Error("Not found");
  }
  await Category.findByIdAndUpdate(q.category, {
    $inc: { questionsCount: -1 },
  });
  res.json({ message: "Deleted" });
});

exports.listByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const questions = await Question.find({ category: categoryId })
    .populate("author", "fullname email role")
    .select("-correctAnswer")
    .lean();
  const formatted = questions.map((q) => ({
    ...q,
    id: q._id,
    author: q.author
      ? {
          id: q.author._id,
          fullName: q.author.fullname,
          email: q.author.email,
          role: q.author.role,
        }
      : null,
  }));
  res.json(formatted);
});
