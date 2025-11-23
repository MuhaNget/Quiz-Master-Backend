const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selectedOption: String,
        isCorrect: Boolean,
        timeTaken: Number,
    },
    { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        questions: [answerSchema],
        score: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        wrongAnswers: { type: Number, default: 0 },
        takenAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
