const Item = require("../models/Item");
const Category = require("../models/Category");
const asyncHandler = require("express-async-handler");

// @desc    Get all items
// @route   GET /api/items
const getAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find()
    .populate("category")
    .sort({ lastUpdated: -1 });
  // const items = await Item.find().sort({ last_updated: -1 });
  res.status(200).json(items);
});

// @desc    Get a specific item by name
// @route   GET /api/items/:name
const getItemByName = asyncHandler(async (req, res) => {
  const itemName = req.params.name;
  // const item = await Item.findOne({ name: itemName });
  const item = await Item.findOne({ name: itemName }).populate("category");

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  res.status(200).json(item);
});

// @desc    Get a specific item by item code
// @route   GET /api/items/code/:itemCode
const getItemByCode = asyncHandler(async (req, res) => {
  const itemCode = req.params.itemCode;
  const item = await Item.findOne({ itemCode }).populate("category");

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  res.status(200).json(item);
});

// @desc    Create a new item
// @route   POST /api/items
const createItem = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    itemCode,
    category,
    quantity,
    reorderLevel,
    photo,
  } = req.body;

  if (
    !name ||
    !itemCode ||
    !category ||
    quantity === undefined ||
    reorderLevel === undefined
  ) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Check if the category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error("Invalid category");
  }

  // Check if the item code is unique
  const existingItem = await Item.findOne({ itemCode });
  if (existingItem) {
    res.status(400);
    throw new Error("Item code already exists");
  }

  const newItem = new Item({
    name,
    description,
    itemCode,
    category,
    quantity,
    reorderLevel,
    photo,
  });

  const savedItem = await newItem.save();
  res.status(201).json(savedItem);
});

// @desc    Update an item by ID
// @route   PATCH /api/items/:id
const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    itemCode,
    category,
    quantity,
    reorderLevel,
    photo,
  } = req.body;

  const item = await Item.findById(id);

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  // Only check if the category exists if it's provided in the request
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(400);
      throw new Error("Invalid category");
    }
    item.category = category;
  }

  // Check if the item code is unique if it's updated
  if (itemCode && itemCode !== item.itemCode) {
    const existingItem = await Item.findOne({ itemCode });
    if (existingItem) {
      res.status(400);
      throw new Error("Item code already exists");
    }
    item.itemCode = itemCode;
  }

  // Update other fields if they are provided
  if (name) item.name = name;
  if (description) item.description = description;
  if (quantity !== undefined) item.quantity = quantity;
  if (reorderLevel !== undefined) item.reorderLevel = reorderLevel;
  if (photo) item.photo = photo;
  item.lastUpdated = Date.now();

  const updatedItem = await item.save();
  res.status(200).json(updatedItem);
});

// @desc    Delete an item by ID
// @route   DELETE /api/items/:id
const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  await Item.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Item deleted successfully" });
});

module.exports = {
  getAllItems,
  getItemByName,
  getItemByCode,
  createItem,
  updateItem,
  deleteItem,
};
