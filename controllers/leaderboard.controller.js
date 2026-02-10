const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

// GET /api/v1/leaderboard?page=1&limit=10
exports.getLeaderboard = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page || "1");
    const requestedLimit = parseInt(req.query.limit || "10");
    const limit = Math.min(requestedLimit, 50); // Max 50 users
    const skip = (page - 1) * limit;
    const users = await User.find({ totalPoints: { $gt: 0 } }) // Only users with points > 0
        .sort({ totalPoints: -1 })
        .skip(skip)
        .limit(limit)
        .select("fullname totalPoints");
    // ensure current user in top 3 is handled on client side, but we include current user data as well
    res.json({ page, users });
});
