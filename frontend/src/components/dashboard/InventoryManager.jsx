import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";

const InventoryManager = ({ user }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // We'll assume the staff's branch ID is 1 for now.
  // In a real app, this would come from the user object.
  const branchId = 1;

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient.getInventory(branchId);
      // Initialize local state for input fields
      const inventoryWithInputs = data.map((item) => ({
        ...item,
        inputQty: item.quantity || 0,
      }));
      setInventory(inventoryWithInputs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, inputQty: value } : item
      )
    );
  };

  const handleUpdateStock = async (productId, quantity) => {
    setMessage("");
    try {
      const response = await apiClient.updateStock(
        productId,
        branchId,
        quantity
      );
      setMessage(`Product #${productId}: ${response.message}`);
      // Optimistically update the main quantity to reflect the change
      setInventory((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, quantity: quantity } : item
        )
      );
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    } catch (err) {
      setError(
        `Failed to update stock for product #${productId}: ${err.message}`
      );
    }
  };

  if (loading) return <p>Loading inventory...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {message && (
        <p className="text-green-600 mb-4 font-semibold">{message}</p>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Product Name</th>
              <th className="py-2 px-4 text-left w-32">Current Stock</th>
              <th className="py-2 px-4 text-left w-48">Update Quantity</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.product_id} className="border-b">
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4 font-semibold">
                  {item.quantity || 0}
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.inputQty}
                      onChange={(e) =>
                        handleQuantityChange(item.product_id, e.target.value)
                      }
                      className="w-20 p-1 border rounded"
                    />
                    <button
                      onClick={() =>
                        handleUpdateStock(item.product_id, item.inputQty)
                      }
                      className="bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManager;
