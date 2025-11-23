const express = require("express");
const router = express.Router();
const { startQuiz, submitQuiz } = require("../controllers/quiz.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/start", protect, startQuiz); // ?category_id=...
router.post("/submit", protect, submitQuiz);

module.exports = router;
