const Category = require("../models/Category");
const Item = require("../models/Item");
const asyncHandler = require("express-async-handler");

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ last_updated: -1 });
  res.status(200).json(categories);
});

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json(category);
});

// @desc    Create a new category
// @route   POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  const newCategory = new Category({
    name,
    description,
  });

  //   const newCategory = await Category.create({ name, description });

  const savedCategory = await newCategory.save();
  res.status(201).json(savedCategory);
});

// @desc    Update a category by ID
// @route   PATCH /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  category.name = name || category.name;
  category.description = description || category.description;

  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
});

// @desc    Delete a category by ID
// @route   DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Check if there are any items in this category
  const itemsInCategory = await Item.countDocuments({ category: id });

  if (itemsInCategory > 0) {
    res.status(400);
    throw new Error(
      "Cannot delete category with existing items. Please remove or reassign items first."
    );
  }

  await Category.findByIdAndDelete(id);

  res.status(200).json({ message: "Category deleted successfully" });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
