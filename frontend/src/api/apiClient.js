// This file is the bridge between the React frontend and the Express backend.

const API_BASE_URL = "http://localhost:5000/api";
const API_BASE_URL = "http://localhost:5000/api";

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers =
    options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const token = localStorage.getItem("token");
  const headers =
    options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const finalOptions = { ...options, headers };

  const response = await fetch(url, finalOptions);
  const finalOptions = { ...options, headers };

  const response = await fetch(url, finalOptions);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

const apiClient = {
  login: async (username, password) => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("token", data.token);
      }
      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login API error:", error);
      console.error("Login API error:", error);
      return { success: false, message: error.message };
    }
  },

  logout: async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token");
    return { success: true };
  },

  getMedicines: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/products`);
    } catch (error) {
      console.error("Get Medicines API error:", error);
      console.error("Get Medicines API error:", error);
      throw error;
    }
  },

  getDashboardData: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/management/dashboard`);
    } catch (error) {
      console.error("Get Dashboard Data API error:", error);
      console.error("Get Dashboard Data API error:", error);
      throw error;
    }
  },


  getCustomerProfile: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/customers/profile`);
      return await fetchWithAuth(`${API_BASE_URL}/customers/profile`);
    } catch (error) {
      console.error("Get Customer Profile API error:", error);
      throw error;
      console.error("Get Customer Profile API error:", error);
      throw error;
    }
  },

  uploadPrescription: async (file) => {
    try {
      const formData = new FormData();
      formData.append("prescriptionFile", file);
      return await fetchWithAuth(`${API_BASE_URL}/prescriptions/upload`, {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Upload Prescription API error:", error);
      throw error;
    }
  },

  getPendingPrescriptions: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/prescriptions/pending`);
    } catch (error) {
      console.error("Get Pending Prescriptions API error:", error);
      throw error;
    }
  },

  validatePrescription: async (prescriptionId, status, notes) => {
    try {
      return await fetchWithAuth(
        `${API_BASE_URL}/prescriptions/${prescriptionId}/validate`,
        {
          method: "PUT",
          body: JSON.stringify({ status, notes }),
        }
      );
    } catch (error) {
      console.error("Validate Prescription API error:", error);
      throw error;
    }
  },

  placeOrder: async (orderData) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders`, {
        method: "POST",
        body: JSON.stringify(orderData),
      });
    } catch (error) {
      console.error("Place Order API error:", error);
      throw error;
    }
  },

  getInventory: async (branchId) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/inventory/${branchId}`);
    } catch (error) {
      console.error("Get Inventory API error:", error);
      throw error;
    }
  },

  updateStock: async (productId, branchId, quantity) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/inventory`, {
        method: "PUT",
        body: JSON.stringify({ productId, branchId, quantity }),
      });
    } catch (error) {
      console.error("Update Stock API error:", error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/products`, {
        method: "POST",
        body: JSON.stringify(productData),
      });
    } catch (error) {
      console.error("Create Product API error:", error);
      throw error;
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
    } catch (error) {
      console.error("Update Product API error:", error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete Product API error:", error);
      throw error;
    }
  },

  getOrdersByStatus: async (status) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/status/${status}`);
    } catch (error) {
      console.error(`Get Orders (${status}) API error:`, error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error("Update Order Status API error:", error);
      throw error;
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}`);
    } catch (error) {
      console.error(`Get Order Details API error:`, error);
      throw error;
    }
  },
};

export default apiClient;
