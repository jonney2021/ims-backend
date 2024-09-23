const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
    maxLength: [50, "Item name must not be more than 50 characters long"],
  },
  description: {
    type: String,
    trim: true,
    maxLength: [200, "Description must not be more than 200 characters long"],
  },
  itemCode: {
    type: String,
    required: [true, "Item code is required"],
    unique: true,
    trim: true,
    maxLength: [20, "Item code must not be more than 20 characters long"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
    default: 0,
  },
  reorderLevel: {
    type: Number,
    required: [true, "Reorder level is required"],
    min: [0, "Reorder level cannot be negative"],
    default: 10, // Adjust this default as per your business logic
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  photo: {
    type: String,
    default: "https://via.placeholder.com/100", // Default placeholder image URL
  },
  lowStockEmailSent: { type: Boolean, default: false },
  lowStockEmailSentDate: { type: Date },
});

module.exports = mongoose.model("Item", itemSchema);
