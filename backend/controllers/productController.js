// This controller handles the logic for product-related API endpoints.

const db = require("../config/db"); // Import the database connection pool

/**
 * @desc    Get all active products from the database
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    // UPDATED QUERY: Only select products that are marked as active.
    const [products] = await db.query(
      "SELECT * FROM product WHERE is_active = TRUE"
    );

    // Send the list of products as a JSON response.
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products." });
  }
};

/**
 * @desc    Get a single product by its ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [product] = await db.query(
      "SELECT * FROM product WHERE product_id = ? AND is_active = TRUE",
      [id]
    );

    if (product.length > 0) {
      res.status(200).json(product[0]);
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${req.params.id}:`, error);
    res.status(500).json({ message: "Server error while fetching product." });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Branch Manager)
 */
const createProduct = async (req, res) => {
  const { name, description, price, requires_prescription } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO product (name, description, price, requires_prescription) VALUES (?, ?, ?, ?)",
      [name, description, price, requires_prescription]
    );
    res
      .status(201)
      .json({
        message: "Product created successfully.",
        productId: result.insertId,
      });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error during product creation." });
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private (Branch Manager)
 */
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, requires_prescription } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required." });
  }

  try {
    const [result] = await db.query(
      "UPDATE product SET name = ?, description = ?, price = ?, requires_prescription = ? WHERE product_id = ?",
      [name, description, price, requires_prescription, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json({ message: "Product updated successfully." });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error during product update." });
  }
};

/**
 * @desc    Deactivate (soft-delete) a product
 * @route   DELETE /api/products/:id
 * @access  Private (Branch Manager)
 */
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Soft-delete by setting is_active to FALSE
    const [result] = await db.query(
      "UPDATE product SET is_active = FALSE WHERE product_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json({ message: "Product deactivated successfully." });
  } catch (error) {
    console.error("Error deactivating product:", error);
    res
      .status(500)
      .json({ message: "Server error during product deactivation." });
  }
};

// Export the controller functions to be used in the route definitions.
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
