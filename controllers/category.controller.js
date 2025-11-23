const asyncHandler = require("express-async-handler");
const Category = require("../models/category.model");

// GET /api/v1/categories
exports.listCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().lean();
    res.json(categories);
});

// POST create
exports.createCategory = asyncHandler(async (req, res) => {
    const { name, icon, color } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("Name required");
    }
    const cat = await Category.create({ name, icon, color });
    res.status(201).json(cat);
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    if (!cat) {
        res.status(404);
        throw new Error("Not found");
    }
    res.json(cat);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) {
        res.status(404);
        throw new Error("Not found");
    }
    res.json({ message: "Deleted" });
});
