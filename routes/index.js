const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/categories", require("./category.routes"));
router.use("/questions", require("./question.routes"));
router.use("/quizzes", require("./quiz.routes"));
router.use("/users", require("./user.routes"));
router.use("/scores", require("./score.routes"));
router.use("/leaderboard", require("./leaderboard.routes"));

module.exports = router;
