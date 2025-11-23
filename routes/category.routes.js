const express = require("express");
const router = express.Router();
const {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/category.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/", listCategories);
router.post("/", protect, adminOnly, createCategory);
router.patch("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
