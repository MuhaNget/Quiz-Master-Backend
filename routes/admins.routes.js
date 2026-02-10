const express = require("express");
const router = express.Router();
const {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/admins.controller");
const { protect, adminOnly, superAdminOnly } = require("../middlewares/auth.middleware");

router.get("/", protect, adminOnly, listAdmins);
router.get("/:id", protect, adminOnly, getAdmin);
router.post("/", protect, superAdminOnly, createAdmin);
router.put("/:id", protect, superAdminOnly, updateAdmin);
router.delete("/:id", protect, superAdminOnly, deleteAdmin);

module.exports = router;
