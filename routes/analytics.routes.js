const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getCategoryPerformance,
} = require("../controllers/analytics.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/dashboard", protect, adminOnly, getDashboard);
router.get("/category-performance", protect, adminOnly, getCategoryPerformance);

module.exports = router;
