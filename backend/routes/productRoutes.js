// productRoutes.js
// Author: Minh Hieu Tran
// This file defines the API routes for product-related operations.

const express = require('express');
const router = express.Router();

// Import the controller functions that contain the logic for each route.
const {
  getAllProducts,
  getProductById,
} = require('../controllers/productController');

// --- Route Definitions ---

// @route   GET /api/products
// @desc    Get a list of all products
// @access  Public
router.get('/', getAllProducts);

// @route   GET /api/products/:id
// @desc    Get a single product by its ID
// @access  Public
router.get('/:id', getProductById);

// We will add protected routes for POST, PUT, DELETE later.

module.exports = router;
