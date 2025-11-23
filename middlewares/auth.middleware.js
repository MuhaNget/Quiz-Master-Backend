const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

exports.protect = asyncHandler(async (req, res, next) => {
    let token = null;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        res.status(401);
        throw new Error("Not authorized");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(401);
            throw new Error("Not authorized");
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(401);
        throw new Error("Token invalid");
    }
});

exports.adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        res.status(403);
        throw new Error("Admins only");
    }
    next();
};
