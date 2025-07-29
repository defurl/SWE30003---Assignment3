const db = require("../config/db");

/**
 * @desc    Initiates payment for an order
 * @route   POST /api/payment/:id
 * @access  Private (Customer)
 */
const initiatePayment = async (req, res) => {
  const customerId = req.user.id;
  const { id: orderId } = req.params;
  try {
    const [result] = await db.query(
      "UPDATE `order` SET status = 'awaiting_verification' WHERE order_id = ? AND customer_id = ? AND status = 'pending_payment'",
      [orderId, customerId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Order not found or not ready for payment." });
    }
    res
      .status(200)
      .json({ message: "Order sent to cashier for payment verification." });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ message: "Server error while initiating payment." });
  }
};

/**
 * @desc    Gets the payment queue for cashier
 * @route   GET /api/payment/queue
 * @access  Private (Cashier)
 */
const getPaymentQueue = async (req, res) => {
  try {
    const [orders] = await db.query(`
            SELECT o.order_id, o.order_date, o.total_amount, c.first_name, c.last_name
            FROM \`order\` o
            JOIN customer c ON o.customer_id = c.customer_id
            WHERE o.status = 'awaiting_verification'
            ORDER BY o.order_date ASC
        `);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching payment queue:", error);
    res.status(500).json({ message: "Server error while fetching queue." });
  }
};

/**
 * @desc    Confirms payment for an order
 * @route   PUT /api/payment/:id
 * @access  Private (Cashier)
 */
const confirmPayment = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentMethod } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.query(
      "SELECT * FROM `order` WHERE order_id = ? AND status = 'awaiting_verification' FOR UPDATE",
      [orderId]
    );
    if (orders.length === 0)
      throw new Error("Order not found or not awaiting verification.");

    const order = orders[0];

    const [paymentResult] = await connection.query(
      "INSERT INTO payment (order_id, payment_method, amount, status) VALUES (?, ?, ?, ?)",
      [orderId, paymentMethod, order.total_amount, "completed"]
    );
    const paymentId = paymentResult.insertId;

    await connection.query(
      "INSERT INTO receipt (payment_id, receipt_data) VALUES (?, ?)",
      [paymentId, JSON.stringify({ message: "Payment confirmed by cashier." })]
    );

    await connection.query(
      "UPDATE `order` SET status = 'processing' WHERE order_id = ?",
      [orderId]
    );
    await connection.query(
      "UPDATE delivery SET status = 'preparing' WHERE order_id = ?",
      [orderId]
    );

    await connection.commit();
    res
      .status(200)
      .json({
        message:
          "Payment confirmed. Order is now being processed for fulfillment.",
      });
  } catch (error) {
    await connection.rollback();
    console.error("Error confirming payment:", error);
    res.status(500).json({
      message: error.message || "Server error during payment confirmation.",
    });
  } finally {
    connection.release();
  }
};

module.exports = {
    initiatePayment,
    getPaymentQueue,
    confirmPayment
}; 