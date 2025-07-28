// This file is the bridge between the React frontend and the Express backend.

const API_BASE_URL = 'http://localhost:5000/api';

const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = { ...options, headers };
    
    console.log('Making request to:', url); // Debug log
    console.log('With options:', finalOptions); // Debug log
    
    const response = await fetch(url, finalOptions);

    console.log('Response status:', response.status); // Debug log
    console.log('Response headers:', response.headers); // Debug log

    if (!response.ok) {
        const responseText = await response.text();
        console.error('Error response text:', responseText); // Debug log
        
        try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
            throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}...`);
        }
    }
    
    return response.json();
};


const apiClient = {
  login: async (username, password) => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login API error:', error);
      return { success: false, message: error.message };
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    return { success: true };
  },

  getMedicines: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/products`);
    } catch (error) {
      console.error('Get Medicines API error:', error);
      throw error;
    }
  },

  getDashboardData: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/management/dashboard`);
    } catch (error) {
      console.error('Get Dashboard Data API error:', error);
      throw error;
    }
  },
  
  getCustomerProfile: async () => {
    try {
        return await fetchWithAuth(`${API_BASE_URL}/customers/profile`);
    } catch (error) {
        console.error('Get Customer Profile API error:', error);
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
      // This is a public route, so no token is needed, but we can reuse the helper
      return await fetchWithAuth(`${API_BASE_URL}/products/${id}`);
    } catch (error) {
      console.error('Get Medicine By ID API error:', error);
      throw error;
    }
  },

  /**
   * (Customer) Places an initial order with items from the cart.
   * @param {Array} items - Array of { productId, quantity }.
   * @param {number} branchId - The ID of the branch for the order.
   * @returns {Promise<object>} The server's response with orderId and status.
   */
  placeOrder: async (items, branchId) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify({ items, branchId }),
      });
    } catch (error) {
      console.error('Place Order API error:', error);
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
      // 'prescriptionFile' must match the name used in multer's upload.single() on the backend
      formData.append('prescriptionFile', file);

      return await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/prescriptions`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Upload Prescription for Order API error:', error);
      throw error;
    }
  },

  /**
   * (Pharmacist) Fetches all orders with a 'pending_prescription' status.
   * @returns {Promise<Array>} A list of pending order objects.
   */
  getOrderValidationQueue: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/validation-queue`);
    } catch (error) {
      console.error('Get Order Validation Queue API error:', error);
      throw error;
    }
  },

  /**
   * (Pharmacist) Fetches all prescriptions associated with a specific order.
   * @param {string|number} orderId - The ID of the order.
   * @returns {Promise<Array>} A list of prescription objects for that order.
   */
  getOrderPrescriptions: async (orderId) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/prescriptions`);
    } catch (error) {
      console.error('Get Order Prescriptions API error:', error);
      throw error;
    }
  },

  /**
   * (Pharmacist) Validates an entire order.
   * @param {string|number} orderId - The ID of the order to validate.
   * @param {string} decision - The new status ('approved' or 'rejected').
   * @returns {Promise<object>} The server's confirmation response.
   */
  validateOrder: async (orderId, decision) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/validate`, {
        method: 'PUT',
        body: JSON.stringify({ decision }),
      });
    } catch (error) {
      console.error('Validate Order API error:', error);
      throw error;
    }
  },

  /**
   * "Pays" for a specific order.
   * @param {string|number} orderId - The ID of the order to pay for.
   * @param {string} paymentMethod - The method of payment.
   * @returns {Promise<object>} The server's confirmation response.
   */
  payForOrder: async (orderId, paymentMethod) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/pay`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod }),
      });
    } catch (error) {
      console.error('Pay for Order API error:', error);
      throw error;
    }
  },

    /**
   * (Customer) Initiates the payment process, moving the order to the cashier's queue.
   * @param {string|number} orderId - The ID of the order to initiate payment for.
   */
  initiatePayment: async (orderId) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/initiate-payment`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Initiate Payment API error:', error);
      throw error;
    }
  },

  /**
   * (Cashier) Fetches all orders awaiting payment verification.
   * @returns {Promise<Array>} A list of pending order objects.
   */
  getPaymentQueue: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/payment-queue`);
    } catch (error) {
      console.error('Get Payment Queue API error:', error);
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
      return await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/confirm-payment`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod }),
      });
    } catch (error) {
      console.error('Confirm Payment API error:', error);
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
      console.error('Get Order By ID API error:', error);
      throw error;
    }
  },
  
};

export default apiClient;
