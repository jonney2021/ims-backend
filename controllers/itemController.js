const Item = require("../models/Item");
const Category = require("../models/Category");
const asyncHandler = require("express-async-handler");
const sendLowStockEmail = require("../utils/lowStockEmailer");
const cloudinary = require("cloudinary").v2;

// @desc    Get all items
// @route   GET /api/items
const getAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find()
    .populate("category")
    .sort({ lastUpdated: -1 });
  // const items = await Item.find().sort({ last_updated: -1 });
  res.status(200).json(items);
});

// @desc    Get a specific item by ID
// @route   GET /api/items/:id
const getItemById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const item = await Item.findById(id).populate("category");

  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  res.status(200).json(item);
});

// @desc    Get a specific item by name
// @route   GET /api/items/name/:name
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
  const { name, description, itemCode, category, quantity, reorderLevel } =
    req.body;

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

  let photo = "https://via.placeholder.com/100"; // Default placeholder image URL

  // Handle image upload to Cloudinary if a file is provided
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "IMS items",
        resource_type: "image",
      });
      photo = result.secure_url; // Use the secure URL from Cloudinary
    } catch (error) {
      res.status(500);
      throw new Error("Image upload failed. Please try again.");
    }
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
  const { name, description, itemCode, category, quantity, reorderLevel } =
    req.body;

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

  let photo = item.photo; // Keep the existing photo by default

  // Handle image upload to Cloudinary if a file is provided
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "IMS items",
        resource_type: "image",
      });
      photo = result.secure_url; // Use the secure URL from Cloudinary
    } catch (error) {
      res.status(500);
      throw new Error("Image upload failed. Please try again.");
    }
  }
  item.lastUpdated = Date.now();

  // const updatedItem = await item.save();
  // res.status(200).json(updatedItem);
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        name: name || item.name,
        description: description || item.description,
        itemCode: itemCode || item.itemCode,
        category: category || item.category,
        quantity: quantity !== undefined ? quantity : item.quantity,
        reorderLevel:
          reorderLevel !== undefined ? reorderLevel : item.reorderLevel,
        photo: photo,
        lastUpdated: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate("category");

    console.log("Updated item:", updatedItem);

    if (!updatedItem) {
      res.status(404);
      throw new Error("Item not found");
    }

    // Check if the item is now low in stock and email hasn't been sent
    if (
      updatedItem.quantity <= updatedItem.reorderLevel &&
      !updatedItem.lowStockEmailSent
    ) {
      await sendLowStockEmail(updatedItem);
      updatedItem.lowStockEmailSent = true;
      updatedItem.lowStockEmailSentDate = new Date();
      await updatedItem.save();
    }

    // If quantity is now above reorder level, reset the flag
    if (
      updatedItem.quantity > updatedItem.reorderLevel &&
      updatedItem.lowStockEmailSent
    ) {
      updatedItem.lowStockEmailSent = false;
      updatedItem.lowStockEmailSentDate = null;
      await updatedItem.save();
    }

    console.log("Updated item:", updatedItem);

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500);
    throw new Error("Failed to update item. Please try again.");
  }
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

// @desc    Get all low stock items
// @route   GET /api/items/low-stock
const getLowStockItems = asyncHandler(async (req, res) => {
  const lowStockItems = await Item.find({
    $expr: { $lte: ["$quantity", "$reorderLevel"] },
  }).populate("category");

  res.status(200).json(lowStockItems);
});

module.exports = {
  getAllItems,
  getItemById,
  getItemByName,
  getItemByCode,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems,
};
