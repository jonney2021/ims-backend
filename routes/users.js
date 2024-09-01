const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  loginStatus,
  updateProfile,
  changePassword,
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

module.exports = router;
