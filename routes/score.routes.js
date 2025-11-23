const express = require("express");
const router = express.Router();
const { overview, history } = require("../controllers/score.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/overview/:user_id", protect, overview);
router.get("/history/:user_id", protect, history);

module.exports = router;
