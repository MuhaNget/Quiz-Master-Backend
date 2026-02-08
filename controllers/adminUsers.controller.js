const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

// GET /users
exports.listUsers = asyncHandler(async (req, res) => {
  const role = req.query.role;
  let filter = {};

  if (!role) {
    // No role specified - fetch all users (excluding admins)
    filter = { role: "user" };
  } else if (role === "admin" || role === "super_admin") {
    // Fetch all admins (both admin and super_admin)
    filter = { role: { $in: ["admin", "super_admin"] } };
  } else {
    filter = { role };
  }

  const users = await User.find(filter).select("-password").lean();
  const formattedUsers = users.map((u) => ({
    ...u,
    fullName: u.fullname,
    id: u._id,
  }));
  res.json(formattedUsers);
});

// GET /users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: "user" })
    .select("-password")
    .lean();
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({
    ...user,
    fullName: user.fullname,
    id: user._id,
  });
});

// POST /users
exports.createUser = asyncHandler(async (req, res) => {
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
  const user = await User.create({ fullname, email, password, role: "user" });
  res.status(201).json({
    id: user._id,
    fullName: user.fullname,
    email: user.email,
    role: user.role,
  });
});

// PUT /users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: "user" }).select(
    "+password",
  );
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { fullname, email, password } = req.body;
  if (fullname) user.fullname = fullname;
  if (email) user.email = email;
  if (password) user.password = password;
  await user.save();

  res.json({
    id: user._id,
    fullName: user.fullname,
    email: user.email,
    role: user.role,
  });
});

// DELETE /users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const deleted = await User.findOneAndDelete({
    _id: req.params.id,
    role: "user",
  });
  if (!deleted) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true });
});
