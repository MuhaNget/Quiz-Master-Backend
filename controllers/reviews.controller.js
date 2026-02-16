const asyncHandler = require("express-async-handler");
const Review = require("../models/review.model");

// POST /reviews
exports.createReview = asyncHandler(async (req, res) => {
  const { userName, userEmail, rating, feedback } = req.body;

  if (!userName || !userEmail || rating === undefined) {
    res.status(400);
    throw new Error("Missing required fields: userName, userEmail, rating");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be an integer between 1 and 5");
  }

  const review = await Review.create({
    userId: req.user._id,
    userName,
    userEmail,
    rating,
    feedback: feedback || null,
  });

  res.status(201).json({
    id: review._id,
    userId: review.userId,
    userName: review.userName,
    userEmail: review.userEmail,
    rating: review.rating,
    feedback: review.feedback,
    createdAt: review.createdAt,
  });
});

// GET /reviews
exports.listReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "10");
  const rating = req.query.rating ? parseInt(req.query.rating) : null;
  const dateFilter = req.query.dateFilter;

  const filter = {};
  if (rating) filter.rating = rating;

  if (dateFilter === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    filter.createdAt = { $gte: start };
  } else if (dateFilter === "last7days") {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    filter.createdAt = { $gte: start };
  } else if (dateFilter === "last30days") {
    const start = new Date();
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    filter.createdAt = { $gte: start };
  } else if (dateFilter === "last90days") {
    const start = new Date();
    start.setDate(start.getDate() - 89);
    start.setHours(0, 0, 0, 0);
    filter.createdAt = { $gte: start };
  }

  const skip = (page - 1) * limit;
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    reviews: reviews.map((r) => ({
      id: r._id,
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      rating: r.rating,
      feedback: r.feedback,
      createdAt: r.createdAt,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /reviews/:id
exports.getReview = asyncHandler(async (req, res) => {
  const r = await Review.findById(req.params.id).lean();
  if (!r) {
    res.status(404);
    throw new Error("Review not found");
  }
  res.json({
    id: r._id,
    userId: r.userId,
    userName: r.userName,
    userEmail: r.userEmail,
    rating: r.rating,
    feedback: r.feedback,
    createdAt: r.createdAt,
  });
});

// DELETE /reviews/:id
exports.deleteReview = asyncHandler(async (req, res) => {
  const deleted = await Review.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("Review not found");
  }
  res.json({ success: true });
});
