const express = require("express");
const router = express.Router();
const {
  bootstrapAdmin,
  listUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getAdminStats,
} = require("../controllers/admin.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

// Bootstrap first admin (no auth, guarded by setup key)
router.post("/bootstrap", bootstrapAdmin);

// Admin-only routes
router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/users", protect, adminOnly, listUsers);
router.get("/users/:id", protect, adminOnly, getUser);
router.patch("/users/:id/role", protect, adminOnly, updateUserRole);
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
