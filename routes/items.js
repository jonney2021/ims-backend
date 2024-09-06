const express = require("express");
const {
  getAllItems,
  getItemByName,
  getItemByCode,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { upload } = require("../utils/fileUpload");

const router = express.Router();

// Routes
router.get("/", getAllItems); // Get all items
router.get("/:name", getItemByName); // Get a specific item by name
router.get("/:itemCode", getItemByCode); // Get a specific item by item code
router.post("/", upload.single("photo"), createItem); // Create a new item
router.patch("/:id", updateItem); // Update an item by ID
router.delete("/:id", deleteItem); // Delete an item by ID

module.exports = router;
