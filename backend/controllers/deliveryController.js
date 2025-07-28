const db = require("../config/db");

/**
 * @desc    Get the queue of orders ready for fulfillment
 * @route   GET /api/delivery/queue
 * @access  Private (WarehousePersonnel)
 */
const getFulfillmentQueue = async (req, res) => {
  const branchId = req.user.branchId;
  try {
    const [orders] = await db.query(
      `
            SELECT 
                o.order_id, o.order_date, c.first_name, c.last_name,
                d.delivery_method, d.status as delivery_status
            FROM \`order\` o
            JOIN delivery d ON o.order_id = d.order_id
            JOIN customer c ON o.customer_id = c.customer_id
            WHERE o.branch_id = ? AND o.status = 'processing'
            ORDER BY o.order_date ASC
        `,
      [branchId]
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching fulfillment queue:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * @desc    Update the status of a delivery
 * @route   PUT /api/delivery/:orderId/status
 * @access  Private (WarehousePersonnel)
 */
const updateDeliveryStatus = async (req, res) => {
  const { orderId } = req.params;
  const { newStatus } = req.body;
  const validStatuses = [
    "preparing",
    "ready_for_pickup",
    "out_for_delivery",
    "completed",
  ];

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ message: "Invalid status provided." });
  }

  try {
    const [result] = await db.query(
      "UPDATE delivery SET status = ? WHERE order_id = ?",
      [newStatus, orderId]
    );

    // If delivery is done, also mark the main order as completed
    if (newStatus === "completed") {
      await db.query(
        "UPDATE `order` SET status = 'completed' WHERE order_id = ?",
        [orderId]
      );
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Delivery record not found for this order." });
    }
    res
      .status(200)
      .json({ message: `Delivery status updated to ${newStatus}.` });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getFulfillmentQueue,
  updateDeliveryStatus,
};
