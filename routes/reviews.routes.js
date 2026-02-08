const express = require("express");
const router = express.Router();
const {
  listReviews,
  getReview,
  deleteReview,
} = require("../controllers/reviews.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/", protect, adminOnly, listReviews);
router.get("/:id", protect, adminOnly, getReview);
router.delete("/:id", protect, adminOnly, deleteReview);

module.exports = router;
