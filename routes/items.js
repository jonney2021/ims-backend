const express = require("express");
const {
  getAllItems,
  getItemById,
  getItemByName,
  getItemByCode,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems,
} = require("../controllers/itemController");
const { upload } = require("../utils/fileUpload");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Routes
router.get("/", getAllItems); // Get all items
router.get("/low-stock", getLowStockItems);
router.get("/:id", getItemById); // Get a specific item by ID
router.get("/name/:name", getItemByName); // Get a specific item by name
router.get("/code/:itemCode", getItemByCode); // Get a specific item by item code

router.post("/", upload.single("photo"), protect, createItem); // Create a new item
router.patch("/:id", upload.single("photo"), protect, updateItem); // Update an item by ID
router.delete("/:id", protect, deleteItem); // Delete an item by ID

module.exports = router;
