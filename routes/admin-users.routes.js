const express = require("express");
const router = express.Router();
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/adminUsers.controller");
const {
  protect,
  adminOnly,
  superAdminOnly,
} = require("../middlewares/auth.middleware");

router.get("/", protect, adminOnly, listUsers);
router.get("/:id", protect, adminOnly, getUser);
router.post("/", protect, adminOnly, createUser);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, superAdminOnly, deleteUser);

module.exports = router;
