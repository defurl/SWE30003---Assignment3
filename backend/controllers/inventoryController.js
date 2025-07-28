const db = require("../config/db");

/**
 * @desc    Get all inventory items for the logged-in staff's branch
 * @route   GET /api/inventory
 * @access  Private (WarehousePersonnel)
 */
const getBranchInventory = async (req, res) => {
  const branchId = req.user.branchId;
  if (!branchId) {
    return res
      .status(403)
      .json({ message: "User is not assigned to a branch." });
  }
  try {
    const [inventoryItems] = await db.query(
      `SELECT i.product_id, p.name, i.quantity
             FROM inventory i
             JOIN product p ON i.product_id = p.product_id
             WHERE i.branch_id = ?
             ORDER BY p.name`,
      [branchId]
    );
    res.status(200).json(inventoryItems);
  } catch (error) {
    console.error("Error fetching branch inventory:", error);
    res.status(500).json({ message: "Server error while fetching inventory." });
  }
};

/**
 * @desc    Manually update the quantity of a single product in the inventory
 * @route   PUT /api/inventory/update
 * @access  Private (WarehousePersonnel)
 */
const updateStockQuantity = async (req, res) => {
  const branchId = req.user.branchId;
  const { productId, newQuantity } = req.body;

  if (newQuantity === null || newQuantity === undefined || newQuantity < 0) {
    return res
      .status(400)
      .json({ message: "A valid new quantity is required." });
  }

  try {
    const [result] = await db.query(
      "UPDATE inventory SET quantity = ? WHERE product_id = ? AND branch_id = ?",
      [newQuantity, productId, branchId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Product not found in this branch inventory." });
    }

    res.status(200).json({ message: "Stock quantity updated successfully." });
  } catch (error) {
    console.error("Error updating stock quantity:", error);
    res.status(500).json({ message: "Server error while updating stock." });
  }
};

/**
 * @desc    Receive a shipment of products and update inventory
 * @route   POST /api/inventory/receive
 * @access  Private (WarehousePersonnel)
 */
const receiveStock = async (req, res) => {
  const branchId = req.user.branchId;
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Shipment items are required." });
  }
  if (!branchId) {
    return res
      .status(403)
      .json({ message: "User is not assigned to a branch." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error("Invalid item data in shipment.");
      }
      await connection.query(
        `INSERT INTO inventory (product_id, branch_id, quantity)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
        [item.productId, branchId, item.quantity]
      );
    }

    await connection.commit();
    res.status(200).json({ message: "Inventory updated successfully." });
  } catch (error) {
    await connection.rollback();
    console.error("Error receiving stock:", error);
    res
      .status(500)
      .json({
        message: error.message || "Server error while updating inventory.",
      });
  } finally {
    connection.release();
  }
};

module.exports = {
  getBranchInventory,
  updateStockQuantity,
  receiveStock,
};
