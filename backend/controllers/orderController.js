// This controller handles the entire new order and validation workflow.

const db = require("../config/db");
const { get } = require("../routes/orderRoutes");

/**
 * @desc    Customer places an initial order from their cart
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
const placeInitialOrder = async (req, res) => {
  const customerId = req.user.id;
  const { items, branchId, fulfillment } = req.body;

  if (!items || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Order must contain at least one item." });
  }
  if (!branchId) {
    return res.status(400).json({ message: "Branch ID is required." });
  }
  if (
    !fulfillment ||
    !["home_delivery", "in_store_pickup"].includes(fulfillment.method)
  ) {
    return res
      .status(400)
      .json({ message: "A valid fulfillment method is required." });
  }
  if (fulfillment.method === "home_delivery" && !fulfillment.address) {
    return res
      .status(400)
      .json({ message: "Address is required for home delivery." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of items) {
      const [inventoryCheck] = await connection.query(
        "SELECT quantity FROM inventory WHERE product_id = ? AND branch_id = ? FOR UPDATE",
        [item.productId, branchId]
      );

      if (
        inventoryCheck.length === 0 ||
        inventoryCheck[0].quantity < item.quantity
      ) {
        throw new Error(
          `Insufficient stock for product ID ${item.productId}. Available: ${
            inventoryCheck[0]?.quantity || 0
          }, Required: ${item.quantity}`
        );
      }

      await connection.query(
        "UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND branch_id = ?",
        [item.quantity, item.productId, branchId]
      );
    }

    const productIds = items.map((item) => item.productId);
    const [products] = await connection.query(
      "SELECT product_id, price, requires_prescription FROM product WHERE product_id IN (?)",
      [productIds]
    );

    const requiresPrescription = products.some((p) => p.requires_prescription);
    const initialStatus = requiresPrescription
      ? "pending_prescription"
      : "pending_payment";

    let totalAmount = 0;
    const productMap = new Map(products.map((p) => [p.product_id, p]));
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product)
        throw new Error(`Product with ID ${item.productId} not found.`);
      totalAmount += product.price * item.quantity;
    }

    const [orderResult] = await connection.query(
      "INSERT INTO `order` (customer_id, branch_id, status, total_amount) VALUES (?, ?, ?, ?)",
      [customerId, branchId, initialStatus, totalAmount]
    );
    const orderId = orderResult.insertId;

    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId);
      return [orderId, item.productId, item.quantity, product.price];
    });

    await connection.query(
      "INSERT INTO order_item (order_id, product_id, quantity, price_per_unit) VALUES ?",
      [orderItemsData]
    );

    await connection.query(
      `INSERT INTO delivery (order_id, delivery_method, address, status) VALUES (?, ?, ?, 'pending')`,
      [orderId, fulfillment.method, fulfillment.address || null]
    );

    await connection.commit();

    res.status(201).json({
      message: "Order placed successfully.",
      orderId,
      status: initialStatus,
    });
  } catch (error) {
    await connection.rollback();
    console.error("--- ERROR PLACING ORDER ---", error);
    res
      .status(500)
      .json({
        message: error.message || "Server error during order placement.",
      });
  } finally {
    connection.release();
  }
};

const uploadPrescriptionForOrder = async (req, res) => {
  const customerId = req.user.id;
  const { id: orderId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file." });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const [orderCheck] = await db.query(
      "SELECT status FROM `order` WHERE order_id = ? AND customer_id = ?",
      [orderId, customerId]
    );
    if (
      orderCheck.length === 0 ||
      (orderCheck[0].status !== "pending_prescription" &&
        orderCheck[0].status !== "cancelled")
    ) {
      return res
        .status(403)
        .json({ message: "This order is not awaiting a prescription." });
    }

    const [existingPrescriptions] = await db.query(
      "SELECT status FROM prescription WHERE order_id = ? AND status = 'pending'",
      [orderId]
    );

    if (existingPrescriptions.length > 0) {
      return res
        .status(400)
        .json({
          message: "A prescription for this order is already pending review.",
        });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "INSERT INTO prescription (customer_id, order_id, image_url, status) VALUES (?, ?, ?, ?)",
        [customerId, orderId, imageUrl, "pending"]
      );

      if (orderCheck[0].status === "cancelled") {
        await connection.query(
          "UPDATE `order` SET status = 'pending_prescription' WHERE order_id = ?",
          [orderId]
        );
      }

      await connection.commit();
      res
        .status(201)
        .json({
          message: "Prescription uploaded successfully for your order.",
        });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error uploading prescription for order:", error);
    res
      .status(500)
      .json({ message: "Server error during prescription upload." });
  }
};

const getValidationQueue = async (req, res) => {
  try {
    const [orders] = await db.query(`
            SELECT o.order_id, o.order_date, o.total_amount, c.first_name, c.last_name
            FROM \`order\` o
            JOIN customer c ON o.customer_id = c.customer_id
            WHERE o.status = 'pending_prescription'
            ORDER BY o.order_date ASC
        `);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching validation queue:", error);
    res.status(500).json({ message: "Server error while fetching queue." });
  }
};

// Kwan's note:
// Define this function in the prescriptionController.js instead

// const validateOrder = async (req, res) => {
//   const { id: orderId } = req.params;
//   const { decision, prescriptionId, notes } = req.body;

//   if (!["approved", "rejected"].includes(decision)) {
//     return res.status(400).json({ message: "Invalid decision." });
//   }
//   if (decision === "rejected" && !prescriptionId) {
//     return res
//       .status(400)
//       .json({ message: "Prescription ID is required for rejection." });
//   }

//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     if (decision === "approved") {
//       await connection.query(
//         "UPDATE `order` SET status = 'pending_payment' WHERE order_id = ? AND status = 'pending_prescription'",
//         [orderId]
//       );
//       await connection.query(
//         "UPDATE prescription SET status = 'approved', pharmacist_id = ?, notes = 'Approved', validated_at = CURRENT_TIMESTAMP WHERE order_id = ? AND status = 'pending'",
//         [req.user.id, orderId]
//       );
//     } else {
//       await connection.query(
//         "UPDATE prescription SET status = 'rejected', pharmacist_id = ?, notes = ?, validated_at = CURRENT_TIMESTAMP WHERE prescription_id = ?",
//         [req.user.id, notes, prescriptionId]
//       );
//       await connection.query(
//         "UPDATE `order` SET status = 'cancelled' WHERE order_id = ?",
//         [orderId]
//       );
//     }

//     await connection.commit();
//     res.status(200).json({ message: `Prescription has been ${decision}.` });
//   } catch (error) {
//     await connection.rollback();
//     console.error("Error validating order:", error);
//     res
//       .status(500)
//       .json({ message: error.message || "Server error during validation." });
//   } finally {
//     connection.release();
//   }
// };

// Kwan's note:
// prescription controller already contained a function to get prescriptions by prescription ID
// const getPrescriptionsForOrder = async (req, res) => {
//   const { id: orderId } = req.params;
//   try {
//     if (req.user.role !== "pharmacist") {
//       return res.status(403).json({ message: "Forbidden." });
//     }
//     const [prescriptions] = await db.query(
//       "SELECT prescription_id, image_url, uploaded_at FROM prescription WHERE order_id = ? AND status = 'pending'",
//       [orderId]
//     );
//     res.status(200).json(prescriptions);
//   } catch (error) {
//     console.error("Error fetching prescriptions for order:", error);
//     res
//       .status(500)
//       .json({ message: "Server error while fetching prescriptions." });
//   }
// };

const getOrderById = async (req, res) => {
  const { id: orderId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let query = `
            SELECT o.order_id, o.customer_id, o.order_date, o.total_amount, o.status,
                   c.first_name, c.last_name, c.email
            FROM \`order\` o
            JOIN customer c ON o.customer_id = c.customer_id
            WHERE o.order_id = ?
        `;

    const queryParams = [orderId];
    if (userRole === "customer") {
      query += " AND o.customer_id = ?";
      queryParams.push(userId);
    }

    const [orders] = await db.query(query, queryParams);

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    const [items] = await db.query(
      `
            SELECT oi.product_id, oi.quantity, oi.price_per_unit,
                   p.name as product_name, p.description
            FROM order_item oi
            JOIN product p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
            `,
      [orderId]
    );

    const [delivery] = await db.query(
      "SELECT * FROM delivery WHERE order_id = ?",
      [orderId]
    );

    const orderData = {
      ...orders[0],
      items: items,
      delivery: delivery.length > 0 ? delivery[0] : null,
    };

    res.status(200).json(orderData);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error while fetching order." });
  }
};

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
  placeInitialOrder,
  uploadPrescriptionForOrder,
  getValidationQueue,
  getOrderById,
  initiatePayment,
  getPaymentQueue,
  confirmPayment,
};
