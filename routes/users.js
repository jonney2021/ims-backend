const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  loginStatus,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const { adminOnly, protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Routes
// Register route protected by adminOnly middleware
router.post("/register", protect, adminOnly, registerUser);
// Modified Route for Testing (Remove adminOnly temporarily)
// router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// logout route
router.get("/logout", logoutUser);

// get user profile
router.get("/profile", protect, getProfile);

// Route to get login status
router.get("/loggedin", loginStatus);

// Route to update profile
router.patch("/updateprofile", protect, updateProfile);

// Route to change password
router.patch("/changepassword", protect, changePassword);

// Route to forgot password
router.post("/forgotpassword", forgotPassword);

// Route to reset password
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
