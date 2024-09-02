const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/users");
const itemRoutes = require("./routes/items");
const errorHandler = require("./middleware/errorMiddleware");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// // Logging Middleware to check incoming requests
// app.use((req, res, next) => {
//   console.log("Incoming Request:", req.method, req.url);
//   console.log("Request Body:", req.body);
//   next();
// });

// Routes
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

// Error Handler
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Route
app.get("/", (req, res) => {
  res.send("Inventory Management System API");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
