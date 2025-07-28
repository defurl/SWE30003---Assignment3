// This controller handles the entire new order and validation workflow.

const db = require('../config/db');
const { get } = require('../routes/orderRoutes');

/**
 * @desc    Customer places an initial order from their cart
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
const placeInitialOrder = async (req, res) => {
    const customerId = req.user.id;
    // We now expect branchId from the frontend
    const { items, branchId } = req.body; 
  
    console.log('--- PLACING INITIAL ORDER ---');
    console.log('Customer ID:', customerId, 'Branch ID:', branchId);
    console.log('Items:', items);
  
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }
    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is required to place an order.' });
    }
  
    const connection = await db.getConnection();
  
    try {
      await connection.beginTransaction();
  
      const productIds = items.map(item => item.productId);
      const [products] = await connection.query(
        'SELECT product_id, price, requires_prescription FROM product WHERE product_id IN (?)',
        [productIds]
      );
  
      const requiresPrescription = products.some(p => p.requires_prescription);
      const initialStatus = requiresPrescription ? 'pending_prescription' : 'pending_payment';
      console.log('Order requires prescription:', requiresPrescription, 'Initial Status:', initialStatus);
  
      let totalAmount = 0;
      const productMap = new Map(products.map(p => [p.product_id, p]));
      for (const item of items) {
          const product = productMap.get(item.productId);
          if (!product) throw new Error(`Product with ID ${item.productId} not found.`);
          totalAmount += product.price * item.quantity;
      }
      console.log('Calculated Total Amount:', totalAmount);
  
      // --- UPDATED QUERY ---
      // Now includes the branch_id in the insert statement.
      const [orderResult] = await connection.query(
        'INSERT INTO `order` (customer_id, branch_id, status, total_amount) VALUES (?, ?, ?, ?)',
        [customerId, branchId, initialStatus, totalAmount]
      );
      const orderId = orderResult.insertId;
      console.log('Order created with ID:', orderId);
  
      const orderItemsData = items.map(item => {
          const product = productMap.get(item.productId);
          return [orderId, item.productId, item.quantity, product.price];
      });
      
      await connection.query(
          'INSERT INTO order_item (order_id, product_id, quantity, price_per_unit) VALUES ?',
          [orderItemsData]
      );
      console.log('Order items inserted.');
  
      await connection.commit();
      console.log('--- ORDER PLACED SUCCESSFULLY ---');
      
      res.status(201).json({
        message: 'Order placed successfully.',
        orderId,
        status: initialStatus,
      });
  
    } catch (error) {
      await connection.rollback();
      console.error('--- ERROR PLACING ORDER ---', error);
      res.status(500).json({ message: 'Server error during order placement.' });
    } finally {
      connection.release();
    }
  };

/**
 * @desc    Customer uploads a prescription for a specific order
 * @route   POST /api/orders/:id/prescriptions
 * @access  Private (Customer)
 */
const uploadPrescriptionForOrder = async (req, res) => {
    const customerId = req.user.id;
    const { id: orderId } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    try {
        const [orders] = await db.query('SELECT * FROM `order` WHERE order_id = ? AND customer_id = ? AND status = "pending_prescription"', [orderId, customerId]);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found or not awaiting prescription.' });
        }

        const [result] = await db.query('INSERT INTO prescription (customer_id, order_id, image_url, status) VALUES (?, ?, ?, ?)', [customerId, orderId, imageUrl, 'uploaded']);

        res.status(201).json({ message: 'Prescription uploaded successfully for your order.', prescriptionId: result.insertId });
    } catch (error) {
        console.error('Error uploading prescription for order:', error);
        res.status(500).json({ message: 'Server error during prescription upload.' });
    }
};


/**
 * @desc    Pharmacist gets the queue of orders needing prescription validation
 * @route   GET /api/orders/validation-queue
 * @access  Private (Pharmacist)
 */
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
        console.error('Error fetching validation queue:', error);
        res.status(500).json({ message: 'Server error while fetching queue.' });
    }
};

/**
 * @desc    Pharmacist validates an order's prescriptions
 * @route   PUT /api/orders/:id/validate
 * @access  Private (Pharmacist)
 */
const validateOrder = async (req, res) => {
    const { id } = req.params;
    const { decision } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
        return res.status(400).json({ message: 'Invalid decision.' });
    }

    const newStatus = decision === 'approved' ? 'pending_payment' : 'cancelled';

    try {
        const [result] = await db.query("UPDATE `order` SET status = ? WHERE order_id = ? AND status = 'pending_prescription'", [newStatus, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found or not awaiting validation.' });
        }
        res.status(200).json({ message: `Order has been ${decision}.` });
    } catch (error) {
        console.error('Error validating order:', error);
        res.status(500).json({ message: 'Server error during validation.' });
    }
};

/**
 * @desc    Get all prescriptions for a specific order
 * @route   GET /api/orders/:id/prescriptions
 * @access  Private (Pharmacist)
 */
const getPrescriptionsForOrder = async (req, res) => {
    const { id: orderId } = req.params;
    try {
        if (req.user.role !== 'pharmacist') {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const [prescriptions] = await db.query('SELECT prescription_id, image_url, uploaded_at FROM prescription WHERE order_id = ?', [orderId]);
        res.status(200).json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions for order:', error);
        res.status(500).json({ message: 'Server error while fetching prescriptions.' });
    }
};

// ...existing code...

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private (Customer, Pharmacist, Cashier)
 */
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
        
        // If user is a customer, only show their own orders
        const queryParams = [orderId];
        if (userRole === 'customer') {
            query += ' AND o.customer_id = ?';
            queryParams.push(userId);
        }

        const [orders] = await db.query(query, queryParams);
        
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Get order items
        const [items] = await db.query(`
            SELECT oi.product_id, oi.quantity, oi.price_per_unit,
                   p.name as product_name, p.description
            FROM order_item oi
            JOIN product p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [orderId]);

        const orderData = {
            ...orders[0],
            items: items
        };

        res.status(200).json(orderData);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error while fetching order.' });
    }
};

/**
 * @desc    Customer initiates the payment process for an order
 * @route   POST /api/orders/:id/initiate-payment
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
            return res.status(404).json({ message: 'Order not found or not ready for payment.' });
        }
        res.status(200).json({ message: 'Order sent to cashier for payment verification.' });
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ message: 'Server error while initiating payment.' });
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
        console.error('Error fetching payment queue:', error);
        res.status(500).json({ message: 'Server error while fetching queue.' });
    }
};

const confirmPayment = async (req, res) => {
    const { id: orderId } = req.params;
    const { paymentMethod } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [orders] = await connection.query("SELECT * FROM `order` WHERE order_id = ? AND status = 'awaiting_verification' FOR UPDATE", [orderId]);
        if (orders.length === 0) throw new Error('Order not found or not awaiting verification.');
        
        const order = orders[0];
        const [items] = await connection.query('SELECT product_id, quantity FROM order_item WHERE order_id = ?', [orderId]);

        for (const item of items) {
            await connection.query('UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND quantity >= ?', [item.quantity, item.product_id, item.quantity]);
            const [checkResult] = await connection.query('SELECT ROW_COUNT() as count');
            if (checkResult[0].count === 0) throw new Error(`Insufficient stock for product ID ${item.product_id}.`);
        }

        const [paymentResult] = await connection.query('INSERT INTO payment (order_id, payment_method, amount, status) VALUES (?, ?, ?, ?)', [orderId, paymentMethod, order.total_amount, 'completed']);
        const paymentId = paymentResult.insertId;

        await connection.query('INSERT INTO receipt (payment_id, receipt_data) VALUES (?, ?)', [paymentId, JSON.stringify({ message: 'Payment confirmed by cashier.' })]);
        await connection.query("UPDATE `order` SET status = 'completed' WHERE order_id = ?", [orderId]);

        await connection.commit();
        res.status(200).json({ message: 'Payment confirmed and order completed.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: error.message || 'Server error during payment confirmation.' });
    } finally {
        connection.release();
    }
};

module.exports = {
    placeInitialOrder,
    uploadPrescriptionForOrder,
    getValidationQueue,
    validateOrder,
    getPrescriptionsForOrder,
    getOrderById,
    initiatePayment,
    getPaymentQueue,
    confirmPayment,
};
