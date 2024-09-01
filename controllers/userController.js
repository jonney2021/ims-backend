const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @desc    Register a new user
// @route   POST /api/users/register

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if any field is empty
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters long");
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  // Create new user
  const user = await User.create({ username, email, password });

  // Generate token
  // const token = generateToken(user._id);

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      photo: user.photo,
      role: user.role,
      // token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/users/login

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if any field is empty
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill in email and password");
  }

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // User exists and password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (user && isMatch) {
    // Generate JWT token
    const token = generateToken(user._id);

    // Send token in HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      // secure: true, // Enable in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      photo: user.photo,
      role: user.role,
      token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// Logout user
// @route   GET /api/users/logout
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

// Get User Profile
// @route   GET /api/users/profile

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Get login status
// @route   GET /api/users/loggedin

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  // Verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

// Update User Profile
// @route   PATCH /api/users/updateprofile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { username, email, photo } = user;
    user.username = req.body.username || username;
    user.email = email;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      photo: updatedUser.photo,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Change Password
// @route   PATCH /api/users/changepassword
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;
  if (!user) {
    res.status(404);
    throw new Error("User not found, please signup");
  }
  // Validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please fill in old and new password");
  }

  // Check if old password matches in DB
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && isMatch) {
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  loginStatus,
  updateProfile,
  changePassword,
};
