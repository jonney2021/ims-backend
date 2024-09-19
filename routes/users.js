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
  getAllUsers,
  getUserByName,
  adminUpdateUser,
  adminDeleteUser,
} = require("../controllers/userController");
const { adminOnly, protect } = require("../middleware/authMiddleware");
const { upload } = require("../utils/fileUpload");
const router = express.Router();

// Routes
// Register route protected by adminOnly middleware
// router.post("/register", protect, adminOnly, registerUser);
// Modified Route for Testing (Remove adminOnly temporarily)
router.post("/register", upload.single("photo"), registerUser);

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

// Router to admin get all users
router.get("/", getAllUsers);

// Router to admin get user by username
router.get("/:username", protect, adminOnly, getUserByName);

// Router to admin update user
router.patch("/update/:id", protect, adminOnly, adminUpdateUser);

// Router to admin delete user
router.delete("/delete/:id", protect, adminOnly, adminDeleteUser);

module.exports = router;
