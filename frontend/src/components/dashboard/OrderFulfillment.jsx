import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";

// --- NEW: Modal Component for Order Details ---
// This is a self-contained component to display the order details in a pop-up.
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-4">
        <h2 className="text-2xl font-bold mb-4">
          Order Details - #{order.order_id}
        </h2>
        <div className="mb-4 text-sm text-gray-700 space-y-1">
          <p>
            <strong>Customer:</strong> {order.first_name} {order.last_name}
          </p>
          <p>
            <strong>Date:</strong> {new Date(order.order_date).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold capitalize p-1 rounded bg-blue-100 text-blue-800">
              {order.status}
            </span>
          </p>
        </div>
        <div className="border-t py-4 my-4">
          <h3 className="font-semibold mb-2 text-gray-800">Items in Order</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {order.items.map((item, index) => (
              <li
                key={index}
                className={`flex justify-between items-center text-sm pb-1 ${
                  index < order.items.length - 1 ? "border-b" : ""
                }`}
              >
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-gray-500">
                    {item.quantity} x{" "}
                    {parseInt(item.price_per_unit).toLocaleString("vi-VN")} VND
                  </p>
                </div>
                <span className="font-semibold text-gray-900">
                  {(item.quantity * item.price_per_unit).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  VND
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between font-bold text-lg text-gray-900 mt-4">
          <span>Total</span>
          <span>
            {parseInt(order.total_amount).toLocaleString("vi-VN")} VND
          </span>
        </div>
        <div className="text-right mt-6">
          <button
            onClick={onClose}
            className="bg-gray-200 py-2 px-6 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main OrderFulfillment Component ---
const OrderFulfillment = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // --- NEW: State to hold the details of the selected order for the modal ---
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const pendingOrders = await apiClient.getOrdersByStatus("pending");
      setOrders(pendingOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    setMessage("");
    try {
      const response = await apiClient.updateOrderStatus(orderId, status);
      setMessage(`Order #${orderId}: ${response.message}`);
      fetchPendingOrders(); // Refresh the list
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(`Failed to update order #${orderId}: ${err.message}`);
    }
  };

  // --- NEW: Function to fetch and display order details ---
  const handleViewDetails = async (orderId) => {
    try {
      const details = await apiClient.getOrderDetails(orderId);
      setSelectedOrder(details); // Set the selected order to show the modal
    } catch (err) {
      setError(`Could not fetch details for order #${orderId}: ${err.message}`);
    }
  };

  if (loading) return <p>Loading pending orders...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {message && (
        <p className="text-green-600 mb-4 font-semibold">{message}</p>
      )}

      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No pending orders found.
          </p>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Order ID</th>
                <th className="py-2 px-4 text-left">Customer</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-right">Total</th>
                <th className="py-2 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 font-mono">#{order.order_id}</td>
                  <td className="py-2 px-4">
                    {order.first_name} {order.last_name}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(order.order_date).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {parseInt(order.total_amount).toLocaleString("vi-VN")} VND
                  </td>
                  <td className="py-2 px-4 text-center space-x-2">
                    {/* --- NEW: "View" button to trigger the modal --- */}
                    <button
                      onClick={() => handleViewDetails(order.order_id)}
                      className="bg-gray-500 text-white text-sm font-bold py-1 px-3 rounded hover:bg-gray-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(order.order_id, "completed")
                      }
                      className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded hover:bg-green-600"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(order.order_id, "cancelled")
                      }
                      className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- NEW: Render the modal when an order is selected --- */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default OrderFulfillment;
