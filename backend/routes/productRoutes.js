// productRoutes.js
// Author: Minh Hieu Tran
// This file defines the API routes for product-related operations.

const express = require('express');
const router = express.Router();

// Import the controller functions that contain the logic for each route.
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Custom middleware for role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: This route is only for ${roles.join(' or ')}.` });
    }
    next();
  };
};

// Import authentication middleware
const { protect } = require('../middleware/authMiddleware');

// --- Route Definitions ---

// @route   GET /api/products
// @desc    Get a list of all products
// @access  Public
router.get('/', getAllProducts);

// @route   GET /api/products/:id
// @desc    Get a single product by its ID
// @access  Public
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Add a new product
// @access  Private (Warehouse Manager only)
router.post('/', protect, authorize("warehousePersonnel"), addProduct);

// @route   PUT /api/products/:id
// @desc    Update a product by its ID
// @access  Private (Warehouse Manager only)
router.put('/:id', protect, authorize("warehousePersonnel"), updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product by its ID
// @access  Private (Warehouse Manager only)
router.delete('/:id', protect, authorize("warehousePersonnel"), deleteProduct);

module.exports = router;
