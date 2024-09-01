const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Get user id from token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }
});

// Middleware to protect routes, only accessible by admins
const adminOnly = asyncHandler((req, res, next) => {
  // Assuming user info is added to req.user after authentication
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied, admin only.");
  }
});

module.exports = { protect, adminOnly };
