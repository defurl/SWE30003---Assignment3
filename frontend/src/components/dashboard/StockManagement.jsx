import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";

// A new sub-component for managing the current inventory
const CurrentStockView = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // Holds the product being edited
  const [editQuantity, setEditQuantity] = useState(0);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getBranchInventory();
      setInventory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEdit = (item) => {
    setEditing(item.product_id);
    setEditQuantity(item.quantity);
  };

  const handleSave = async (productId) => {
    try {
      await apiClient.updateStockQuantity(productId, editQuantity);
      setEditing(null);
      fetchInventory(); // Refresh data after saving
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <p>Loading inventory...</p>;

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Current Branch Inventory</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 px-4">Product Name</th>
              <th className="py-2 px-4">Current Quantity</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.product_id} className="border-b">
                <td className="py-3 px-4">{item.name}</td>
                <td className="py-3 px-4">
                  {editing === item.product_id ? (
                    <input
                      type="number"
                      value={editQuantity}
                      onChange={(e) =>
                        setEditQuantity(parseInt(e.target.value))
                      }
                      className="w-24 p-1 border border-gray-300 rounded-md"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="py-3 px-4">
                  {editing === item.product_id ? (
                    <>
                      <button
                        onClick={() => handleSave(item.product_id)}
                        className="text-green-600 hover:underline font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="ml-4 text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// The existing component for receiving stock, now as a sub-component
const ReceiveStockView = () => {
  // ... all the logic from the previous StockManagement component goes here
  // (useState for products, shipment, etc. and the handleAddItem, handleReceiveShipment functions)
  const [products, setProducts] = useState([]);
  const [shipment, setShipment] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await apiClient.getMedicines();
      setProducts(data);
      if (data.length > 0) {
        setSelectedProduct(data[0].product_id);
      }
    };
    fetchProducts();
  }, []);

  const handleAddItem = (e) => {
    e.preventDefault();
    setError("");
    const product = products.find(
      (p) => p.product_id === parseInt(selectedProduct)
    );
    if (!product || quantity <= 0) {
      setError("Please select a valid product and quantity.");
      return;
    }
    const existingItemIndex = shipment.findIndex(
      (item) => item.productId === product.product_id
    );
    if (existingItemIndex > -1) {
      const updatedShipment = [...shipment];
      updatedShipment[existingItemIndex].quantity += quantity;
      setShipment(updatedShipment);
    } else {
      setShipment([
        ...shipment,
        {
          productId: product.product_id,
          name: product.name,
          quantity: quantity,
        },
      ]);
    }
    setQuantity(1);
  };

  const handleReceiveShipment = async () => {
    setError("");
    setMessage("");
    if (shipment.length === 0) {
      setError("Please add items to the shipment first.");
      return;
    }
    try {
      const itemsToSubmit = shipment.map(({ productId, quantity }) => ({
        productId,
        quantity,
      }));
      const response = await apiClient.receiveStock(itemsToSubmit);
      setMessage(response.message);
      setShipment([]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {message && (
        <div className="p-3 mb-4 bg-green-100 text-green-800 rounded-md">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}
      <form
        onSubmit={handleAddItem}
        className="flex items-end gap-4 mb-6 pb-6 border-b"
      >
        <div className="flex-grow">
          <label
            htmlFor="product"
            className="block text-sm font-medium text-gray-700"
          >
            Product
          </label>
          <select
            id="product"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700"
          >
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            className="mt-1 block w-24 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Add to Shipment
        </button>
      </form>
      <h3 className="font-semibold text-lg mb-2">Current Shipment</h3>
      <div className="space-y-2 mb-6 min-h-[100px]">
        {shipment.length > 0 ? (
          <ul className="list-disc pl-5">
            {shipment.map((item) => (
              <li key={item.productId}>
                {item.name} - Quantity: <strong>{item.quantity}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No items added yet.</p>
        )}
      </div>
      <button
        onClick={handleReceiveShipment}
        disabled={shipment.length === 0}
        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        Confirm Shipment Received
      </button>
    </div>
  );
};

// Main component with tabs
const StockManagement = () => {
  const [activeTab, setActiveTab] = useState("manage");

  const tabClass = (tabName) =>
    `px-4 py-2 font-semibold rounded-t-lg ${
      activeTab === tabName
        ? "bg-white border-b-0 border-l border-t border-r"
        : "bg-gray-100 cursor-pointer"
    }`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Inventory Management
      </h2>
      <div className="border-b mb-4 flex">
        <div
          onClick={() => setActiveTab("manage")}
          className={tabClass("manage")}
        >
          Manage Current Stock
        </div>
        <div
          onClick={() => setActiveTab("receive")}
          className={tabClass("receive")}
        >
          Receive Incoming Stock
        </div>
      </div>

      <div>
        {activeTab === "manage" && <CurrentStockView />}
        {activeTab === "receive" && <ReceiveStockView />}
      </div>
    </div>
  );
};

export default StockManagement;
