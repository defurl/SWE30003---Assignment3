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

/**
 * @desc    Add a new product to the database
 * @route   POST /api/products
 * @access  Private (Warehouse Manager only)
 */
const addProduct = async (req, res) => {
  try {
    const { name, title, requires_prescription, price } = req.body;

    // Validate required fields
    if (!name || !title || requires_prescription === undefined || !price) {
      return res.status(400).json({ 
        message: 'All fields are required: name, title, requires_prescription, price' 
      });
    }

    // Validate price is a positive number
    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    // Validate requires_prescription is 0 or 1
    if (requires_prescription !== 0 && requires_prescription !== 1) {
      return res.status(400).json({ message: 'requires_prescription must be 0 or 1' });
    }

    // Insert new product into database
    const [result] = await db.query(
      'INSERT INTO product (name, title, requires_prescription, price) VALUES (?, ?, ?, ?)',
      [name, title, requires_prescription, parseFloat(price)]
    );

    res.status(201).json({
      message: 'Product added successfully',
      productId: result.insertId,
      product: {
        product_id: result.insertId,
        name,
        title,
        requires_prescription,
        price: parseFloat(price)
      }
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error while adding product.' });
  }
};

/**
 * @desc    Update a product by its ID
 * @route   PUT /api/products/:id
 * @access  Private (Warehouse Manager only)
 */
const updateProduct = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, title, requires_prescription, price } = req.body;

    // Check if product exists
    const [existingProduct] = await db.query('SELECT * FROM product WHERE product_id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Validate at least one field is provided
    if (!name && !title && requires_prescription === undefined && !price) {
      return res.status(400).json({ 
        message: 'At least one field must be provided: name, title, requires_prescription, price' 
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];

    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (title) {
      updateFields.push('title = ?');
      values.push(title);
    }
    if (requires_prescription !== undefined) {
      if (requires_prescription !== 0 && requires_prescription !== 1) {
        return res.status(400).json({ message: 'requires_prescription must be 0 or 1' });
      }
      updateFields.push('requires_prescription = ?');
      values.push(requires_prescription);
    }
    if (price) {
      if (isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
      }
      updateFields.push('price = ?');
      values.push(parseFloat(price));
    }

    values.push(id);

    // Execute update query
    const [result] = await db.query(
      `UPDATE product SET ${updateFields.join(', ')} WHERE product_id = ?`,
      values
    );

    // Get updated product
    const [updatedProduct] = await db.query('SELECT * FROM product WHERE product_id = ?', [id]);

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct[0]
    });
  } catch (error) {
    console.error(`Error updating product with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error while updating product.' });
  }
};

/**
 * @desc    Delete a product by its ID
 * @route   DELETE /api/products/:id
 * @access  Private (Warehouse Manager only)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existingProduct] = await db.query('SELECT * FROM product WHERE product_id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if product is referenced in other tables (orders, inventory, etc.)
    const [orderItems] = await db.query('SELECT COUNT(*) as count FROM order_items WHERE product_id = ?', [id]);
    if (orderItems[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product. It is referenced in existing orders.' 
      });
    }

    // Delete the product
    await db.query('DELETE FROM product WHERE product_id = ?', [id]);

    res.status(200).json({
      message: 'Product deleted successfully',
      deletedProduct: existingProduct[0]
    });
  } catch (error) {
    console.error(`Error deleting product with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error while deleting product.' });
  }
};



// Export the controller functions to be used in the route definitions.
module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
