const express = require("express");

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Routes
router.get("/", getCategories); // Get all categories
router.get("/:id", getCategory); // Get a single category by ID
router.post("/", adminOnly, createCategory); // Create a new category
router.patch("/:id", adminOnly, updateCategory); // Update a category by ID
router.delete("/:id", adminOnly, deleteCategory); // Delete a category by ID

module.exports = router;
