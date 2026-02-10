const express = require("express");
const router = express.Router();
const {
  getStats,
  updateProfile,
  updatePassword,
  deleteAccount,
  activities,
} = require("../controllers/user.controller");
const { protect, superAdminOnly } = require("../middlewares/auth.middleware");

router.get("/:id/stats", protect, getStats);
router.get("/:id/activities", protect, activities);
router.patch("/:id", protect, updateProfile);
router.patch("/:id/password", protect, updatePassword);
router.delete("/:id", protect, superAdminOnly, deleteAccount);

module.exports = router;
