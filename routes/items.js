const express = require("express");
const {
  getAllItems,
  getItemByName,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const router = express.Router();

// Routes
router.get("/", getAllItems); // Get all items
router.get("/:name", getItemByName); // Get a specific item by name
router.post("/", createItem); // Create a new item
router.patch("/:id", updateItem); // Update an item by ID
router.delete("/:id", deleteItem); // Delete an item by ID

module.exports = router;
