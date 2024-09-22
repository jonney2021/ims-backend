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
  getUserById,
  getUserByName,
  adminUpdateUser,
  adminDeleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../utils/fileUpload");
const router = express.Router();

// Routes
// Register route protected by adminOnly middleware
// router.post("/register", protect, adminOnly, registerUser);
// Modified Route for Testing (Remove adminOnly temporarily)
router.post("/register", upload.single("photo"), protect, registerUser);

// Login route
router.post("/login", loginUser);

// logout route
router.get("/logout", logoutUser);

// get user profile
router.get("/profile", getProfile);

// Route to update profile
router.patch("/updateprofile", upload.single("photo"), protect, updateProfile);

// Route to get login status
router.get("/loggedin", loginStatus);

// Route to change password
router.put("/changepassword", protect, changePassword);

// Route to forgot password
router.post("/forgotpassword", forgotPassword);

// Route to reset password
router.put("/resetpassword/:resetToken", resetPassword);

// Router to admin get all users
router.get("/", getAllUsers);

// Router to admin get user by id
router.get("/:id", getUserById);

// Router to admin get user by username
// router.get("/:username", protect, getUserByName);
router.get("/:username", getUserByName);

// Router to admin update user
// router.patch("/update/:id", protect, adminOnly, adminUpdateUser);
router.patch("/:id", upload.single("photo"), protect, adminUpdateUser);

// Router to admin delete user
router.delete("/:id", protect, adminDeleteUser);

module.exports = router;
