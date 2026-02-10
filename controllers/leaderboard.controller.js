const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

// GET /api/v1/leaderboard?limit=3
exports.getLeaderboard = asyncHandler(async (req, res) => {
    const requestedLimit = parseInt(req.query.limit || "3");
    const limit = Math.min(requestedLimit, 50); // Max 50 users
    const users = await User.find({ totalPoints: { $gt: 0 } }) // Only users with points > 0
        .sort({ totalPoints: -1 })
        .limit(limit)
        .select("fullname totalPoints");
    
    res.json({ users, total: users.length });
});
