const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

// GET /admins
exports.listAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({
    role: { $in: ["admin", "super_admin"] },
  }).select("-password");
  res.json(admins);
});

// GET /admins/:id
exports.getAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOne({
    _id: req.params.id,
    role: { $in: ["admin", "super_admin"] },
  }).select("-password");
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }
  res.json(admin);
});

// POST /admins
exports.createAdmin = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;
  if (!fullname || !email || !password) {
    res.status(400);
    throw new Error("fullname, email, and password are required");
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }
  const admin = await User.create({ fullname, email, password, role: "admin" });
  res.status(201).json({
    id: admin._id,
    fullname: admin.fullname,
    email: admin.email,
    role: admin.role,
  });
});

// PUT /admins/:id
exports.updateAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOne({
    _id: req.params.id,
    role: { $in: ["admin", "super_admin"] },
  }).select("+password");
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  const { fullname, email, password } = req.body;
  if (fullname) admin.fullname = fullname;
  if (email) admin.email = email;
  if (password) admin.password = password;
  await admin.save();

  res.json({
    id: admin._id,
    fullname: admin.fullname,
    email: admin.email,
    role: admin.role,
  });
});

// DELETE /admins/:id
exports.deleteAdmin = asyncHandler(async (req, res) => {
  if (req.user && req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error("You cannot delete your own account");
  }

  const adminToDelete = await User.findById(req.params.id);
  if (adminToDelete && adminToDelete.role === "super_admin") {
    res.status(403);
    throw new Error("Cannot delete super admin");
  }

  const deleted = await User.findOneAndDelete({
    _id: req.params.id,
    role: { $in: ["admin", "super_admin"] },
  });
  if (!deleted) {
    res.status(404);
    throw new Error("Admin not found");
  }
  res.json({ success: true });
});
