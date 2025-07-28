// productRoutes.js
// This file defines the API routes for product-related operations.

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Import the controller functions that contain the logic for each route.
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Custom middleware for role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: `Forbidden: This route is only for ${roles.join(" or ")}.`,
        });
    }
    next();
  };
};

// --- Public Routes ---
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// --- Protected Manager Routes ---
router.post("/", protect, authorize("branchManager"), createProduct);
router.put("/:id", protect, authorize("branchManager"), updateProduct);
router.delete("/:id", protect, authorize("branchManager"), deleteProduct);

module.exports = router;
