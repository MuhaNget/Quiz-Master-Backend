const express = require("express");
const router = express.Router();
const {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/admins.controller");
const { protect, superAdminOnly } = require("../middlewares/auth.middleware");

router.get("/", protect, superAdminOnly, listAdmins);
router.get("/:id", protect, superAdminOnly, getAdmin);
router.post("/", protect, superAdminOnly, createAdmin);
router.put("/:id", protect, superAdminOnly, updateAdmin);
router.delete("/:id", protect, superAdminOnly, deleteAdmin);

module.exports = router;
