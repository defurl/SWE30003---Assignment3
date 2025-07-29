import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";

const FulfillmentQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getFulfillmentQueue();
      setQueue(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    setOrderDetails(null); // Reset details while loading
    try {
      const details = await apiClient.getOrderById(order.order_id);
      setOrderDetails(details);
    } catch (err) {
      setError(`Could not fetch details for order #${order.order_id}`);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;
    try {
      await apiClient.updateDeliveryStatus(selectedOrder.order_id, newStatus);
      alert("Status updated successfully!");
      setSelectedOrder(null);
      setOrderDetails(null);
      fetchQueue();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusClass = (status) => {
    if (status === "home_delivery") return "bg-purple-100 text-purple-800";
    return "bg-orange-100 text-orange-800";
  };

  if (loading) return <p>Loading fulfillment queue...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-lg mb-4 border-b pb-2">
          Fulfillment queue ({queue.length})
        </h3>
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
          {queue.map((order) => (
            <li
              key={order.order_id}
              onClick={() => handleSelectOrder(order)}
              className={`p-3 rounded-md cursor-pointer ${
                selectedOrder?.order_id === order.order_id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">Order #{order.order_id}</p>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                    order.delivery_method
                  )}`}
                >
                  {order.delivery_method.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {order.first_name} {order.last_name}
              </p>
              <p className="text-sm text-gray-500">
                Status:{" "}
                <span className="font-semibold">{order.delivery_status}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
        {selectedOrder ? (
          orderDetails ? (
            <div>
              <h3 className="text-xl font-bold mb-4">
                Processing order #{selectedOrder.order_id}
              </h3>

              {orderDetails.delivery ? (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-800">
                    Fulfillment details
                  </p>
                  <p>
                    <strong>Method:</strong>{" "}
                    <span className="capitalize">
                      {orderDetails.delivery.delivery_method}
                    </span>
                  </p>
                  {orderDetails.delivery.delivery_method ===
                    "home_delivery" && (
                    <p>
                      <strong>Address:</strong> {orderDetails.delivery.address}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-red-500">
                  Error: Fulfillment details missing for this order.
                </p>
              )}

              <div className="mb-6 border-t border-b py-4">
                <h4 className="font-semibold mb-2">Items:</h4>
                {orderDetails.items.map((item) => (
                  <p key={item.order_item_id} className="text-sm">
                    {item.product_name} (x{item.quantity})
                  </p>
                ))}
              </div>
              <div className="space-y-2">
                {orderDetails.delivery?.delivery_method ===
                "in_store_pickup" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate("ready_for_pickup")}
                      className="flex-1 bg-yellow-500 text-white font-bold py-2 rounded-lg hover:bg-yellow-600"
                    >
                      Ready for Pickup
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("completed")}
                      className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600"
                    >
                      Customer Collected
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate("out_for_delivery")}
                      className="flex-1 bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600"
                    >
                      Out for Delivery
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("completed")}
                      className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600"
                    >
                      Delivered
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>Loading order details...</p>
          )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select an order to process.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FulfillmentQueue;
