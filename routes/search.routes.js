const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controllers/search.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/", protect, globalSearch);

module.exports = router;
