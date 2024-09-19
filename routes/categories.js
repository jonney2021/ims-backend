const express = require("express");

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

// Routes
router.get("/", getCategories); // Get all categories
router.get("/:id", getCategory); // Get a single category by ID
router.post("/", createCategory); // Create a new category
router.patch("/:id", updateCategory); // Update a category by ID
router.delete("/:id", deleteCategory); // Delete a category by ID

module.exports = router;
