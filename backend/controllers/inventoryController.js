const db = require("../config/db");

/**
 * @desc    Get all inventory items for a specific branch
 * @route   GET /api/inventory/:branchId
 * @access  Private (Warehouse Personnel, Branch Manager)
 */
const getInventoryByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const [inventory] = await db.query(
      `SELECT p.product_id, p.name, p.description, i.quantity 
             FROM product p
             LEFT JOIN inventory i ON p.product_id = i.product_id AND i.branch_id = ?
             WHERE p.is_active = TRUE
             ORDER BY p.name`,
      [branchId]
    );
    res.status(200).json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Server error while fetching inventory." });
  }
};

/**
 * @desc    Update stock for a product at a branch
 * @route   PUT /api/inventory
 * @access  Private (Warehouse Personnel, Branch Manager)
 */
const updateStock = async (req, res) => {
  const { productId, branchId, quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: "A valid quantity is required." });
  }

  try {
    // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both new and existing inventory records
    const [result] = await db.query(
      `INSERT INTO inventory (product_id, branch_id, quantity) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = ?`,
      [productId, branchId, quantity, quantity]
    );
    res.status(200).json({ message: "Stock updated successfully." });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Server error during stock update." });
  }
};

module.exports = {
  getInventoryByBranch,
  updateStock,
};
