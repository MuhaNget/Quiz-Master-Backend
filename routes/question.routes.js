const express = require("express");
const router = express.Router();
const {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  listByCategory,
} = require("../controllers/question.controller");
const {
  protect,
  adminOnly,
  superAdminOnly,
} = require("../middlewares/auth.middleware");

router.post("/", protect, adminOnly, createQuestion);
router.patch("/:id", protect, adminOnly, updateQuestion);
router.delete("/:id", protect, superAdminOnly, deleteQuestion);
router.get("/category/:categoryId", protect, listByCategory);

module.exports = router;
