// Mock API client to simulate backend calls.
const apiClient = {
  login: async (username, password) => {
    console.log(`Attempting login for user: ${username}`);
    const users = {
      'customer': { id: 1, name: 'Anh-Quan Nguyen', role: 'customer', email: 'anhquan.nguyen@email.com', phone: '0901234567' },
      'pharmacist': { id: 101, name: 'Minh-Hieu Tran', role: 'pharmacist' },
      'cashier': { id: 102, name: 'Duc-Tam Nguyen', role: 'cashier' },
      'manager': { id: 100, name: 'Dr. Le Minh Duc', role: 'branchManager' },
      'warehouse': { id: 103, name: 'Warehouse Staff', role: 'warehousePersonnel' }
    };
    if (users[username]) {
      return { success: true, user: users[username] };
    }
    return { success: false, message: 'Invalid username or password.' };
  },
  logout: async () => {
    console.log('Logging out.');
    return { success: true };
  },
  // --- NEW MOCK DATA ---
  getCustomerProfile: async (customerId) => {
    if (customerId === 1) {
      return {
        details: {
          name: 'Anh-Quan Nguyen',
          email: 'anhquan.nguyen@email.com',
          phone: '0901234567',
          address: '123 Cau Dien, Cau Giay, Hanoi'
        },
        orderHistory: [
          { id: 'DH-1024', date: '2025-07-18', total: 135000, status: 'Completed' },
          { id: 'DH-1021', date: '2025-07-15', total: 75000, status: 'Completed' },
          { id: 'DH-1015', date: '2025-07-10', total: 250000, status: 'Cancelled' },
        ],
        prescriptions: [
            { id: 'RX-789', medication: 'Amoxicillin 250mg', status: 'Approved', date: '2025-07-14'}
        ]
      };
    }
    return null;
  },
  getDashboardData: async (staffRole) => {
    const data = {
        pharmacist: {
            pendingPrescriptions: 12,
            quickStats: { "Today's Validations": 34, "Rejected": 2 }
        },
        cashier: {
            pendingOrders: 5,
            quickStats: { "Today's Transactions": 58, "Returns Processed": 3 }
        },
        branchManager: {
            teamMembersOnline: 4,
            quickStats: { "Today's Revenue": '15,750,000 VND', "Low Stock Items": 8 }
        },
        warehousePersonnel: {
            incomingShipments: 2,
            quickStats: { "Items to Pick": 124, "Transfers Out": 5 }
        }
    };
    return data[staffRole] || {};
  }
};

export default apiClient;
