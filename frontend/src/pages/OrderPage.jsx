import React, { useState } from "react";
import { useCart } from "../contexts/CartContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient.js";

const OrderPage = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [fulfillmentMethod, setFulfillmentMethod] = useState("in_store_pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setError("");
    try {
      const itemsToOrder = cartItems.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
      }));

      const fulfillmentData = {
        method: fulfillmentMethod,
        address: fulfillmentMethod === "home_delivery" ? deliveryAddress : null,
      };

      const response = await apiClient.placeOrder(
        itemsToOrder,
        1,
        fulfillmentData
      );

      clearCart();

      if (response.status === "pending_prescription") {
        navigate(`/order/${response.orderId}/upload-prescription`);
      } else {
        alert(
          "Order placed successfully! Please go to your profile to complete payment."
        );
        navigate("/profile");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added any items yet.
        </p>
        <Link
          to="/medicines"
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700"
        >
          Browse Medicines
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = fulfillmentMethod === "home_delivery" ? 25000 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Order</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              1. Choose Fulfillment Method
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setFulfillmentMethod("in_store_pickup")}
                className={`flex-1 p-4 border rounded-lg text-left transition-all ${
                  fulfillmentMethod === "in_store_pickup"
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "hover:border-gray-400"
                }`}
              >
                <h3 className="font-bold">In-Store Pickup</h3>
                <p className="text-sm text-gray-500">
                  Collect your order from our pharmacy.
                </p>
              </button>
              <button
                onClick={() => setFulfillmentMethod("home_delivery")}
                className={`flex-1 p-4 border rounded-lg text-left transition-all ${
                  fulfillmentMethod === "home_delivery"
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "hover:border-gray-400"
                }`}
              >
                <h3 className="font-bold">Home Delivery</h3>
                <p className="text-sm text-gray-500">
                  Get your order delivered to your door.
                </p>
              </button>
            </div>
            {fulfillmentMethod === "home_delivery" && (
              <div className="mt-4">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  rows="3"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full street address, ward, district, and city."
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              2. Review Items ({cartItems.length})
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500 p-1 text-center">
                      {item.name}
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {(item.price * item.quantity).toLocaleString("vi-VN")} VND
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString("vi-VN")} VND</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{deliveryFee.toLocaleString("vi-VN")} VND</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Total</span>
              <span>{total.toLocaleString("vi-VN")} VND</span>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={
              isLoading ||
              (fulfillmentMethod === "home_delivery" && !deliveryAddress.trim())
            }
            className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </button>
          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
