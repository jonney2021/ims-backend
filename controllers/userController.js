const User = require("../models/User");
const asyncHandler = require("express-async-handler");

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

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      photo: user.photo,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

module.exports = { registerUser };
