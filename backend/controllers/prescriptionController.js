// This controller handles all logic for prescription management.

const db = require('../config/db');

/**
 * @desc    Customer uploads a new prescription
 * @route   GET /api/prescriptions/details/:id
 * @access  Private (Pharmacist)
 */
const getPrescription = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "pharmacist") {
      return res.status(403).json({ message: "Forbidden." });
    }
    const [prescriptions] = await db.query(
      "SELECT prescription_id, image_url, uploaded_at FROM prescription WHERE prescription_id = ? AND status = 'pending'",
      [id]
    );
    res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Error fetching prescriptions for order:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching prescriptions." });
  }
};

/**
 * @desc    Customer uploads a new prescription FOR an order
 * @route   POST /api/prescriptions/:id
 * @access  Private (Customer)
 */
const uploadPrescription = async (req, res) => {
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
          orderCheck[0].status !== "prescription_declined")
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

        if (orderCheck[0].status === "pending_prescription" || orderCheck[0].status === "prescription_declined") {
          await connection.query(
            "UPDATE `order` SET status = 'awaiting_prescription_validation' WHERE order_id = ?",
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

/**
 * @desc    Pharmacist gets a list of pending prescriptions
 * @route   GET /api/prescriptions/pending
 * @access  Private (Pharmacist)
 */
const getPendingPrescriptions = async (req, res) => {
  try {
    const [prescriptions] = await db.query(`
      SELECT p.prescription_id, p.image_url, p.uploaded_at, p.order_id, c.first_name, c.last_name
      FROM prescription p
      JOIN customer c ON p.customer_id = c.customer_id
      WHERE p.status = 'pending'
      ORDER BY p.uploaded_at ASC
    `);
    res.status(200).json(prescriptions);
  } catch (error) {
    console.error('Error fetching pending prescriptions:', error);
    res.status(500).json({ message: 'Server error while fetching prescriptions.' });
  }
};

/**
 * @desc    Pharmacist validates a prescription (approves or rejects)
 * @route   PUT /api/prescriptions/:id/validate
 * @access  Private (Pharmacist)
 */
const validatePrescription = async (req, res) => {
  const { id } = req.params;
  const { decision, notes } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ message: "Invalid decision." });
  }
  if (decision === "rejected" && !id) {
    return res
      .status(400)
      .json({ message: "Prescription ID is required for rejection." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // First we fetch the prescription details
    const [prescriptionRows] = await connection.query(
      "SELECT prescription_id, order_id FROM prescription WHERE prescription_id = ? AND status = 'pending'",
      [id]
    );
    
    if (prescriptionRows.length === 0) {
      res.status(404).json({ message: "Prescription not found." });
    }
    else {
        const orderId = prescriptionRows[0].order_id;

        if (decision === "approved") {
          await connection.query(
            "UPDATE `order` SET status = 'pending_payment' WHERE order_id = ? AND status = 'awaiting_prescription_validation'",
            [orderId]
          );
          await connection.query(
            "UPDATE prescription SET status = 'approved', pharmacist_id = ?, notes = 'Approved', validated_at = CURRENT_TIMESTAMP WHERE order_id = ? AND status = 'pending'",
            [req.user.id, orderId]
          );
        } else {
          await connection.query(
            "UPDATE prescription SET status = 'rejected', pharmacist_id = ?, notes = ?, validated_at = CURRENT_TIMESTAMP WHERE prescription_id = ?",
            [req.user.id, notes, id]
          );
          await connection.query(
            "UPDATE `order` SET status = 'prescription_declined' WHERE order_id = ?",
            [orderId]
          );
        }
    }

    await connection.commit();
    res.status(200).json({ message: `Prescription has been ${decision}.` });
  } catch (error) {
    await connection.rollback();
    console.error("Error validating prescription:", error);
    res
      .status(500)
      .json({ message: error.message || "Server error during validation." });
  } finally {
    connection.release();
  }
};

module.exports = {
  getPrescription,
  uploadPrescription,
  getPendingPrescriptions,
  validatePrescription,
};
