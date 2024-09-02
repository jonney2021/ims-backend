const Item = require("../models/Item");
const asyncHandler = require("express-async-handler");

// @desc    Get all items
// @route   GET /api/items
const getAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find().sort({ last_updated: -1 });
  res.status(200).json(items);
});

// @desc    Get a specific item by name
// @route   GET /api/items/:name
const getItemByName = asyncHandler(async (req, res) => {
  const itemName = req.params.name;
  const item = await Item.findOne({ name: itemName });

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  res.status(200).json(item);
});

// @desc    Create a new item
// @route   POST /api/items
const createItem = asyncHandler(async (req, res) => {
  const { name, description, quantity, reorder_level, photo } = req.body;

  if (!name || quantity === undefined || reorder_level === undefined) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  const newItem = new Item({
    name,
    description,
    quantity,
    reorder_level,
    photo,
  });

  const savedItem = await newItem.save();
  res.status(201).json(savedItem);
});

// @desc    Update an item by ID
// @route   PATCH /api/items/:id
const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, quantity, reorder_level, photo } = req.body;

  const item = await Item.findById(id);

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  item.name = name || item.name;
  item.description = description || item.description;
  item.quantity = quantity !== undefined ? quantity : item.quantity;
  item.reorder_level =
    reorder_level !== undefined ? reorder_level : item.reorder_level;
  item.photo = photo || item.photo;
  item.last_updated = Date.now();

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

  await item.remove();
  res.status(200).json({ message: "Item deleted successfully" });
});

module.exports = {
  getAllItems,
  getItemByName,
  createItem,
  updateItem,
  deleteItem,
};
