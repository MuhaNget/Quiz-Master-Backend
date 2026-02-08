const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/analytics.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/dashboard", protect, adminOnly, getDashboard);

module.exports = router;
