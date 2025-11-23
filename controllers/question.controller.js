const asyncHandler = require("express-async-handler");
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
    // increment category count
    await Category.findByIdAndUpdate(category, { $inc: { questionsCount: 1 } });
    res.status(201).json(q);
});

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
        .select("-correctAnswer")
        .lean();
    res.json(questions);
});
