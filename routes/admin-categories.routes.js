const express = require("express");
const router = express.Router();
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/adminCategories.controller");
const {
  protect,
  adminOnly,
  superAdminOnly,
} = require("../middlewares/auth.middleware");

router.get("/", protect, adminOnly, listCategories);
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, superAdminOnly, deleteCategory);

module.exports = router;
