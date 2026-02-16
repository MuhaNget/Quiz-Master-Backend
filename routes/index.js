const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/quizzes", require("./quiz.routes"));
router.use("/admin", require("./admin.routes"));
router.use("/scores", require("./score.routes"));
router.use("/leaderboard", require("./leaderboard.routes"));

// Public/User routes (read-only for non-admins)
router.use("/public/categories", require("./category.routes"));
router.use("/public/questions", require("./question.routes"));

// User routes
router.use("/user", require("./user.routes"));

// Admin panel routes (v1 base)
router.use("/admins", require("./admins.routes"));
router.use("/users", require("./admin-users.routes"));
router.use("/categories", require("./admin-categories.routes"));
router.use("/questions", require("./admin-questions.routes"));
router.use("/analytics", require("./analytics.routes"));
router.use("/reviews", require("./reviews.routes"));
router.use("/search", require("./search.routes"));

module.exports = router;
