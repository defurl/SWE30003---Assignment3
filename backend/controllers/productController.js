// This controller handles the logic for product-related API endpoints.

const db = require('../config/db'); // Import the database connection pool

/**
 * @desc    Get all products from the database
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM product');
    
    // Send the list of products as a JSON response.
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products.' });
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
    const [product] = await db.query('SELECT * FROM product WHERE product_id = ?', [id]);

    if (product.length > 0) {
      res.status(200).json(product[0]);
    } else {
      res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error while fetching product.' });
  }
};

// Export the controller functions to be used in the route definitions.
module.exports = {
  getAllProducts,
  getProductById,
};
