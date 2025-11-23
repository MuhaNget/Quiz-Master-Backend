const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, select: false },
        joinedAt: { type: Date, default: Date.now },
        lastActive: { type: Date, default: Date.now },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        totalPoints: { type: Number, default: 0 },
        totalQuizzes: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// password hashing
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (plain) {
    return await bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
