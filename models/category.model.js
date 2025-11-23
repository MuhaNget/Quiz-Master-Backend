const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        icon: { type: String },
        color: { type: String },
        questionsCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
