// This file is the bridge between the React frontend and the Express backend.

const API_BASE_URL = "http://localhost:5000/api";

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  // Do not set Content-Type for FormData, the browser does it automatically with the boundary
  const headers =
    options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const finalOptions = { ...options, headers };

  const response = await fetch(url, finalOptions);

  if (!response.ok) {
    const responseText = await response.text();
    try {
      const errorData = JSON.parse(responseText);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    } catch (parseError) {
      // If parsing fails, it's likely a plain text error (like HTML for a 404)
      throw new Error(
        `Server returned non-JSON response: ${responseText.substring(
          0,
          100
        )}...`
      );
    }
  }

  return response.json();
};

const apiClient = {
  login: async (username, password) => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login API error:", error);
      return { success: false, message: error.message };
    }
  },

  logout: async () => {
    localStorage.removeItem("token");
    return { success: true };
  },

  getMedicines: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/products`);
    } catch (error) {
      console.error("Get Medicines API error:", error);
      throw error;
    }
  },

  getDashboardData: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/management/dashboard`);
    } catch (error) {
      console.error("Get Dashboard Data API error:", error);
      throw error;
    }
  },

  getCustomerProfile: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/customers/profile`);
    } catch (error) {
      console.error("Get Customer Profile API error:", error);
      throw error;
    }
  },

  /**
   * Fetches a single medicine by its ID.
   * @param {string|number} id - The ID of the medicine to fetch.
   * @returns {Promise<object>} The medicine object.
   */
  getMedicineById: async (id) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/products/${id}`);
    } catch (error) {
      console.error("Get Medicine By ID API error:", error);
      throw error;
    }
  },

  /**
   * (Customer) Places an initial order with items from the cart.
   * @param {Array<object>} items - Array of { productId, quantity }.
   * @param {number} branchId - The ID of the branch for the order.
   * @param {object} fulfillment - The fulfillment details { method, address }.
   * @returns {Promise<object>} The server's response with orderId and status.
   */
  placeOrder: async (items, branchId, fulfillment) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders`, {
        method: "POST",
        body: JSON.stringify({ items, branchId, fulfillment }),
      });
    } catch (error) {
      console.error("Place Order API error:", error);
      throw error;
    }
  },

  /**
   * (Customer) Uploads a prescription file for a specific order.
   * @param {string|number} orderId - The ID of the order.
   * @param {File} file - The file object to upload.
   * @returns {Promise<object>} The server's confirmation response.
   */
  uploadPrescriptionForOrder: async (orderId, file) => {
    try {
      const formData = new FormData();
      formData.append("prescriptionFile", file);

      return await fetchWithAuth(
        `${API_BASE_URL}/prescriptions/${orderId}`,
        {
          method: "POST",
          body: formData,
        }
      );
    } catch (error) {
      console.error("Upload Prescription for Order API error:", error);
      throw error;
    }
  },

  /**
   * (Pharmacist) Fetches all orders with a 'pending_prescription' status.
   * Kwan's note: Why do we have a "getPendingPrescriptions" in prescription but you
   * also have a "getOrderValidationQueue" in orders?
   * @returns {Promise<Array<object>>} A list of pending order objects.
   */
  getOrderValidationQueue: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/prescriptions/pending`);
    } catch (error) {
      console.error("Get Order Validation Queue API error:", error);
      throw error;
    }
  },

  /**
   * (Pharmacist) Fetches all prescriptions associated with a specific order.
   * @param {string|number} orderId - The ID of the order.
   * @returns {Promise<Array<object>>} A list of prescription objects for that order.
   */
  getOrderPrescriptions: async (prescriptionId) => {
    try {
      return await fetchWithAuth(
        `${API_BASE_URL}/prescriptions/details/${prescriptionId}`
      );
    } catch (error) {
      console.error("Get Order Prescriptions API error:", error);
      throw error;
    }
  },

  /**
   * (Pharmacist) Validates an entire order.
   * @param {string|number} orderId - The ID of the order to validate.
   * @param {string} decision - The new status ('approved' or 'rejected').
   * @param {number} prescriptionId - The ID of the prescription being rejected (null if approved).
   * @param {string} notes - Rejection notes from the pharmacist.
   * @returns {Promise<object>} The server's confirmation response.
   */
  validatePrescription: async (prescriptionId, decision, notes) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/prescriptions/${prescriptionId}/validate`, {
        method: "PUT",
        body: JSON.stringify({ decision, notes }),
      });
    } catch (error) {
      console.error("Validate Prescription API error:", error);
      throw error;
    }
  },

  /**
   * (Customer) Initiates the payment process, moving the order to the cashier's queue.
   * @param {string|number} orderId - The ID of the order to initiate payment for.
   * @returns {Promise<object>} The server's confirmation response.
   */
  initiatePayment: async (orderId) => {
    try {
      return await fetchWithAuth(
        `${API_BASE_URL}/payment/${orderId}`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error("Initiate Payment API error:", error);
      throw error;
    }
  },

  /**
   * (Cashier) Fetches all orders awaiting payment verification.
   * @returns {Promise<Array<object>>} A list of pending order objects.
   */
  getPaymentQueue: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/payment/queue`);
    } catch (error) {
      console.error("Get Payment Queue API error:", error);
      throw error;
    }
  },

  /**
   * (Cashier) Confirms payment for a specific order.
   * @param {string|number} orderId - The ID of the order to confirm.
   * @param {string} paymentMethod - The method of payment confirmed by the cashier.
   * @returns {Promise<object>} The server's confirmation response.
   */
  confirmPayment: async (orderId, paymentMethod) => {
    try {
      return await fetchWithAuth(
        `${API_BASE_URL}/payment/${orderId}`,
        {
          method: "PUT",
          body: JSON.stringify({ paymentMethod }),
        }
      );
    } catch (error) {
      console.error("Confirm Payment API error:", error);
      throw error;
    }
  },

  /**
   * Gets detailed information about a specific order by ID.
   * @param {string|number} orderId - The ID of the order to fetch.
   * @returns {Promise<object>} The order details including items.
   */
  getOrderById: async (orderId) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}`);
    } catch (error) {
      console.error("Get Order By ID API error:", error);
      throw error;
    }
  },

  /**
   * (Warehouse) Gets all inventory for the user's current branch.
   * @returns {Promise<Array<object>>} A list of inventory items.
   */
  getBranchInventory: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/inventory`);
    } catch (error) {
      console.error("Get Branch Inventory API error:", error);
      throw error;
    }
  },

  /**
   * (Warehouse) Manually updates the stock for a single product.
   * @param {number} productId The ID of the product to update.
   * @param {number} newQuantity The new stock count.
   * @returns {Promise<object>} The server's confirmation response.
   */
  updateStockQuantity: async (productId, newQuantity) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/inventory/update`, {
        method: "PUT",
        body: JSON.stringify({ productId, newQuantity }),
      });
    } catch (error) {
      console.error("Update Stock Quantity API error:", error);
      throw error;
    }
  },

  /**
   * (Warehouse) Sends a list of received items to update inventory.
   * @param {Array<object>} items - Array of { productId, quantity }.
   * @returns {Promise<object>} The server's confirmation response.
   */
  receiveStock: async (items) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/inventory/receive`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
    } catch (error) {
      console.error("Receive Stock API error:", error);
      throw error;
    }
  },

  /**
   * (Manager) Fetches a sales report for a given date range.
   * @param {string} startDate - The start date in YYYY-MM-DD format.
   * @param {string} endDate - The end date in YYYY-MM-DD format.
   * @returns {Promise<object>} The sales report data.
   */
  generateSalesReport: async (startDate, endDate) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/reports/sales`, {
        method: "POST",
        body: JSON.stringify({ startDate, endDate }),
      });
    } catch (error) {
      console.error("Generate Sales Report API error:", error);
      throw error;
    }
  },

  /**
   * (Manager) Fetches a performance report for pharmacists.
   * @param {string} startDate - The start date in YYYY-MM-DD format.
   * @param {string} endDate - The end date in YYYY-MM-DD format.
   * @return {Promise<object>} The pharmacist performance report data.
   */
  generatePharmacistReport: async (startDate, endDate) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/reports/pharmacists`, {
        method: "POST",
        body: JSON.stringify({ startDate, endDate }),
      });
    } catch (error) {
      console.error("Generate Pharmacist Performance Report API error:", error);
      throw error;
    }
  },

  /**
   * (Manager) Fetches a delivery report for a given date range.
   * @param {string} startDate - The start date in YYYY-MM-DD format.
   * @param {string} endDate - The end date in YYYY-MM-DD format.
   * @returns {Promise<object>} The delivery report data.
   */

  generateDeliveryReport: async (startDate, endDate) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/reports/delivery`, {
        method: "POST",
        body: JSON.stringify({ startDate, endDate }),
      });
    } catch (error) {
      console.error("Generate Delivery Report API error:", error);
      throw error;
    }
  },

  /**
   * (Warehouse) Fetches the queue of orders ready for fulfillment.
   * @returns {Promise<Array<object>>} The list of orders to be fulfilled.
   */
  getFulfillmentQueue: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/delivery/queue`);
    } catch (error) {
      console.error("Get Fulfillment Queue API error:", error);
      throw error;
    }
  },

  /**
   * Checks the current stock level for a product at a specific branch.
   * @param {number} branchId The ID of the branch.
   * @param {number} productId The ID of the product.
   * @returns {Promise<object>} An object containing the quantity.
   */
  checkStock: async (branchId, productId) => {
    try {
      return await fetchWithAuth(
        `${API_BASE_URL}/inventory/check/${branchId}/${productId}`
      );
    } catch (error) {
      console.error("Check Stock API error:", error);
      throw error;
    }
  },

  /**
   * (Warehouse) Updates the fulfillment status of an order.
   * @param {string|number} orderId The ID of the order to update.
   * @param {string} newStatus The new delivery status.
   * @returns {Promise<object>} The server's confirmation response.
   */
  updateDeliveryStatus: async (orderId, newStatus) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/delivery/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ newStatus }),
      });
    } catch (error) {
      console.error("Update Delivery Status API error:", error);
      throw error;
    }
  },

  /**
   * Gets all notifications for the authenticated user.
   * @returns {Promise<object>} Object containing notifications array and unreadCount.
   */
  getNotifications: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/notifications`);
    } catch (error) {
      console.error("Get Notifications API error:", error);
      throw error;
    }
  },
};

export default apiClient;
