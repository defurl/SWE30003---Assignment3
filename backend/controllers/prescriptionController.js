// This controller handles all logic for prescription management.

const db = require("../config/db");

/**
 * @desc    Customer uploads a new prescription
 * @route   POST /api/prescriptions/upload
 * @access  Private (Customer)
 */
const uploadPrescription = async (req, res) => {
  const customerId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file." });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const [result] = await db.query(
      "INSERT INTO prescription (customer_id, image_url, status) VALUES (?, ?, ?)",
      [customerId, imageUrl, "pending"]
    );
    res.status(201).json({
      message: "Prescription uploaded successfully.",
      prescriptionId: result.insertId,
      filePath: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading prescription:", error);
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
      SELECT p.prescription_id, p.image_url, p.uploaded_at, c.first_name, c.last_name
      FROM prescription p
      JOIN customer c ON p.customer_id = c.customer_id
      WHERE p.status = 'pending'
      ORDER BY p.uploaded_at ASC
    `);
    res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Error fetching pending prescriptions:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching prescriptions." });
  }
};

/**
 * @desc    Pharmacist validates a prescription (approves or rejects)
 * @route   PUT /api/prescriptions/:id/validate
 * @access  Private (Pharmacist)
 */
const validatePrescription = async (req, res) => {
  const pharmacistId = req.user.id;
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status provided." });
  }

  try {
    const [result] = await db.query(
      'UPDATE prescription SET status = ?, pharmacist_id = ?, notes = ?, validated_at = CURRENT_TIMESTAMP WHERE prescription_id = ? AND status = "pending"',
      [status, pharmacistId, notes, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Prescription not found or already validated." });
    }
    res.status(200).json({ message: `Prescription successfully ${status}.` });
  } catch (error) {
    console.error("Error validating prescription:", error);
    res.status(500).json({ message: "Server error during validation." });
  }
};

module.exports = {
  uploadPrescription,
  getPendingPrescriptions,
  validatePrescription,
};
