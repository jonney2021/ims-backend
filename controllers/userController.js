const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/Token");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("cloudinary").v2;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @desc    Register a new user
// @route   POST /api/users/register

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if any required field is empty
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

  // Handle photo upload to Cloudinary
  let photoUrl = "https://i.ibb.co/4pDNDk1/avatar.png"; // default photo
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "IMS users",
        resource_type: "image",
      });
      photoUrl = result.secure_url;
    } catch (error) {
      res.status(500);
      throw new Error("Image upload failed. Please try again.");
    }
  }

  // Create new user
  const user = await User.create({
    username,
    email,
    password,
    role: role || "User", // Use the provided role or default to 'User'
    photo: photoUrl,
  });

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

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Send token in HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      // sameSite: "none",
      // secure: true, // Enable in production
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      photo: user.photo,
      role: user.role,
      token,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
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
  if (!req.user) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    photo: user.photo,
  });
});

// Get login status
// @route   GET /api/users/loggedin
// const loginStatus = asyncHandler(async (req, res) => {
//   const token = req.cookies.token;
//   if (!token) {
//     return res.json(false);
//   }

//   // Verify token
//   const verified = jwt.verify(token, process.env.JWT_SECRET);
//   if (verified) {
//     return res.json(true);
//   }
//   return res.json(false);
// });

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ isLoggedIn: false });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
      const user = await User.findById(verified.id).select("-password");
      return res.json({
        isLoggedIn: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          photo: user.photo,
          role: user.role,
        },
      });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
  }

  return res.json({ isLoggedIn: false });
});

// Update User Profile
// @route   PATCH /api/users/updateprofile
const updateProfile = asyncHandler(async (req, res) => {
  // console.log("Received update profile request:", req.body);
  // console.log("Authenticated user:", req.user);

  // Use the _id from the request body if req.user is undefined
  const userId = req.user?._id || req.body._id;

  if (!userId) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  const user = await User.findById(userId);

  if (user) {
    const { username } = req.body;

    user.username = username || user.username;
    // Email is not updated, keeping it as is

    // Handle photo upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "IMS users",
          resource_type: "image",
        });
        user.photo = result.secure_url;
      } catch (error) {
        res.status(500);
        throw new Error("Image upload failed. Please try again.");
      }
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      photo: updatedUser.photo,
      role: updatedUser.role,
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

// Forgot Password
// @route   POST /api/users/forgotpassword
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create Reset Token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);

  // Hash reset token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save Token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
  }).save();

  // Construct reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // Reset Email
  const message = `
  <h2>Hello ${user.username}</h2>
  <p>You requested a password reset</p>
  <p>Click <a href=${resetUrl}>here</a> to reset your password</p>
  <p>This reset link is valid for only 30 minutes.</p>
  <p>If you did not request a password reset, please ignore this email</p>

  <p>Regards...</p>
  `;
  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  // Send Email
  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500);
    throw new Error("Error sending email");
  }
});

// Reset Password
// @route   PUT /api/users/resetpassword/:resetToken

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash reset token then compare with hashed token in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Find token in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or expired token");
  }

  // Find user
  const user = await User.findById({ _id: userToken.userId });
  user.password = password;
  await user.save();

  // Delete token from DB
  await userToken.deleteOne();
  res.status(200).json({ message: "Password reset successful" });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
  // Fetch all users excluding passwords
  const users = await User.find().select("-password");

  res.status(200).json(users);
});

// @desc    Get user by username
// @route   GET /api/users/:username
// @access  Admin
const getUserByName = asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Find user by username
  const user = await User.findOne({ username }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

// @desc    Get user by id
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find user by ID
  const user = await User.findById(id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

// @desc    Admin Update User
// @route   PATCH /api/users/:id
// @access  Admin
const adminUpdateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  // Find the user by ID
  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update the user's information
  user.username = username || user.username;
  user.email = email || user.email;
  user.role = role || user.role; // Update role only if provided

  // Handle photo upload
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "IMS users",
        resource_type: "image",
      });
      user.photo = result.secure_url;
    } catch (error) {
      res.status(500);
      throw new Error("Image upload failed. Please try again.");
    }
  }

  const updatedUser = await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user: {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      photo: updatedUser.photo,
    },
  });
});

// @desc    Admin Delete User
// @route   DELETE /api/users/:id
// @access  Admin
const adminDeleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the user by ID
  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Delete the user
  await user.deleteOne();
  res.status(200).json({ message: "User deleted successfully" });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  loginStatus,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  getUserByName,
  adminUpdateUser,
  adminDeleteUser,
};
