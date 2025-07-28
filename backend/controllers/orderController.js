const db = require("../config/db");

/**
 * @desc    Create a new order (for online customers)
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
const createOnlineOrder = async (req, res) => {
  const { cart, prescription_id } = req.body;
  const customer_id = req.user.id;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: "Cart cannot be empty." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    let requiresPrescriptionInCart = false;

    const productPromises = cart.map((item) =>
      connection.query(
        "SELECT * FROM product WHERE product_id = ? AND is_active = TRUE",
        [item.id]
      )
    );
    const productResults = await Promise.all(productPromises);

    for (let i = 0; i < cart.length; i++) {
      const [rows] = productResults[i];
      if (rows.length === 0) {
        throw new Error(
          `Product with ID ${cart[i].id} not found or is inactive.`
        );
      }
      const product = rows[0];
      totalAmount += product.price * cart[i].quantity;
      if (product.requires_prescription) {
        requiresPrescriptionInCart = true;
      }
    }

    if (requiresPrescriptionInCart) {
      if (!prescription_id) {
        throw new Error(
          "This order requires a prescription, but none was provided."
        );
      }
      const [prescriptionRows] = await connection.query(
        "SELECT status FROM prescription WHERE prescription_id = ? AND customer_id = ?",
        [prescription_id, customer_id]
      );
      if (prescriptionRows.length === 0) {
        throw new Error(
          "Prescription not found or does not belong to this user."
        );
      }
      if (prescriptionRows[0].status !== "approved") {
        throw new Error(
          `Your prescription is still '${prescriptionRows[0].status}'. You cannot order until it is approved.`
        );
      }
    }

    const [orderResult] = await connection.query(
      "INSERT INTO `order` (customer_id, branch_id, prescription_id, total_amount, status) VALUES (?, ?, ?, ?, ?)",
      [customer_id, 1, prescription_id, totalAmount, "pending"] // Assuming branch_id 1
    );
    const orderId = orderResult.insertId;

    const orderItemPromises = cart.map((item) => {
      const product = productResults[cart.indexOf(item)][0][0];
      return connection.query(
        "INSERT INTO order_item (order_id, product_id, quantity, price_per_unit) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, product.price]
      );
    });
    await Promise.all(orderItemPromises);

    await connection.commit();
    res.status(201).json({ message: "Order created successfully!", orderId });
  } catch (error) {
    await connection.rollback();
    console.error("Online order creation failed:", error);
    res
      .status(400)
      .json({
        message: error.message || "Server error during order creation.",
      });
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get orders by their status
 * @route   GET /api/orders/status/:status
 * @access  Private (Staff)
 */
const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const [orders] = await db.query(
      `SELECT o.order_id, o.order_date, o.total_amount, o.status, c.first_name, c.last_name
             FROM \`order\` o
             JOIN customer c ON o.customer_id = c.customer_id
             WHERE o.status = ?
             ORDER BY o.order_date ASC`,
      [status]
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    res.status(500).json({ message: "Server error while fetching orders." });
  }
};

/**
 * @desc    Update an order's status and deduct inventory if completed
 * @route   PUT /api/orders/:orderId/status
 * @access  Private (Staff)
 */
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "processing", "completed", "cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      "SELECT branch_id FROM `order` WHERE order_id = ?",
      [orderId]
    );
    if (orderResult.length === 0) {
      throw new Error("Order not found.");
    }
    const branchId = orderResult[0].branch_id;

    const [updateResult] = await connection.query(
      "UPDATE `order` SET status = ? WHERE order_id = ?",
      [status, orderId]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error("Order could not be updated.");
    }

    if (status === "completed") {
      const [items] = await connection.query(
        "SELECT product_id, quantity FROM order_item WHERE order_id = ?",
        [orderId]
      );

      for (const item of items) {
        const [inventoryUpdateResult] = await connection.query(
          "UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND branch_id = ? AND quantity >= ?",
          [item.quantity, item.product_id, branchId, item.quantity]
        );
        if (inventoryUpdateResult.affectedRows === 0) {
          throw new Error(
            `Insufficient stock for product ID ${item.product_id}.`
          );
        }
      }
    }

    await connection.commit();
    res.status(200).json({ message: `Order status updated to ${status}.` });
  } catch (error) {
    await connection.rollback();
    console.error(`Error updating order ${orderId}:`, error);
    res
      .status(400)
      .json({ message: error.message || "Server error during order update." });
  } finally {
    connection.release();
  }
};

/**
 * @desc    Get a single order by its ID, including its items
 * @route   GET /api/orders/:orderId
 * @access  Private (Staff)
 */
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [orderResult] = await db.query(
      `SELECT o.order_id, o.order_date, o.total_amount, o.status, c.first_name, c.last_name 
             FROM \`order\` o 
             JOIN customer c ON o.customer_id = c.customer_id 
             WHERE o.order_id = ?`,
      [orderId]
    );

    if (orderResult.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    const [itemsResult] = await db.query(
      `SELECT oi.quantity, oi.price_per_unit, p.name 
             FROM order_item oi 
             JOIN product p ON oi.product_id = p.product_id 
             WHERE oi.order_id = ?`,
      [orderId]
    );

    const orderDetails = {
      ...orderResult[0],
      items: itemsResult,
    };

    res.status(200).json(orderDetails);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching order details." });
  }
};

module.exports = {
  createOnlineOrder,
  getOrdersByStatus,
  updateOrderStatus,
  getOrderById,
};
