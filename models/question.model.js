const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    text: String,
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: { type: String, required: true },
    options: { type: [String], validate: (v) => v.length === 4 },
    correctAnswer: { type: String, required: true, select: false },
    timer: { type: Number, default: 15 },
    score: { type: Number, default: 10 },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Question", questionSchema);
