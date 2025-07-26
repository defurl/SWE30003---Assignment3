// This file is the bridge between the React frontend and the Express backend.

const API_BASE_URL = 'http://localhost:5000/api';

const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    // For FormData, we let the browser set the Content-Type header automatically.
    const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = { ...options, headers };
    
    const response = await fetch(url, finalOptions);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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

  // --- NEW PRESCRIPTION FUNCTIONS ---

  /**
   * (Customer) Uploads a new prescription.
   * @param {string} imageUrl - The URL of the uploaded prescription image.
   * @returns {Promise<object>} The server's confirmation response.
   */

  uploadPrescription: async (file) => {
    try {
      const formData = new FormData();
      // 'prescriptionFile' MUST match the name used in multer's upload.single() on the backend
      formData.append('prescriptionFile', file);

      return await fetchWithAuth(`${API_BASE_URL}/prescriptions/upload`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Upload Prescription API error:', error);
      throw error;
    }
  },

  // --- NEW PHARMACIST FUNCTIONS ---

  /**
   * (Pharmacist) Fetches all prescriptions with a 'pending' status.
   * @returns {Promise<Array>} A list of pending prescription objects.
   */
  getPendingPrescriptions: async () => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/prescriptions/pending`);
    } catch (error) {
      console.error('Get Pending Prescriptions API error:', error);
      throw error;
    }
  },

  /**
   * (Pharmacist) Validates a specific prescription.
   * @param {number} prescriptionId - The ID of the prescription to validate.
   * @param {string} status - The new status ('approved' or 'rejected').
   * @param {string} notes - Optional notes from the pharmacist.
   * @returns {Promise<object>} The server's confirmation response.
   */
  validatePrescription: async (prescriptionId, status, notes) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/prescriptions/${prescriptionId}/validate`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      });
    } catch (error) {
      console.error('Validate Prescription API error:', error);
      throw error;
    }
  },
};

export default apiClient;
