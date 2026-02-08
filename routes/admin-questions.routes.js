const express = require("express");
const router = express.Router();
const {
  listQuestionsGrouped,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/adminQuestions.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/", protect, adminOnly, listQuestionsGrouped);
router.get("/:id", protect, adminOnly, getQuestion);
router.post("/", protect, adminOnly, createQuestion);
router.put("/:id", protect, adminOnly, updateQuestion);
router.delete("/:id", protect, adminOnly, deleteQuestion);

module.exports = router;
