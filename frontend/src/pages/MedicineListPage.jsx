import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../hooks/useAuth"; // <-- Import useAuth

const MedicineCard = ({ medicine }) => {
  const { addToCart } = useCart();
  const { user } = useAuth(); // <-- Get user from auth context
  const [quantity, setQuantity] = useState(1);

  // --- NEW: Check if the user can add to cart ---
  const canAddToCart = user && user.role === "customer";

  const handleAddToCart = () => {
    if (canAddToCart) {
      addToCart(medicine, quantity);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden group flex flex-col transition-shadow duration-300 hover:shadow-xl">
      <div className="relative">
        <Link to={`/medicines/${medicine.product_id}`} className="block">
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center p-4">
            <span className="text-gray-500 text-center font-semibold">
              {medicine.name}
            </span>
          </div>
        </Link>
        <span
          className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full shadow ${
            medicine.requires_prescription
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {medicine.requires_prescription ? "PRESCRIPTION" : "OTC"}
        </span>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <Link
          to={`/medicines/${medicine.product_id}`}
          className="block flex-grow"
        >
          <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {medicine.name}
          </h3>
          <p className="text-gray-600 text-sm mt-1 flex-grow line-clamp-2">
            {medicine.description}
          </p>
        </Link>
        <div className="pt-4 mt-auto">
          <p className="text-blue-600 font-extrabold text-2xl mb-3">
            {parseInt(medicine.price).toLocaleString("vi-VN")} VND
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value)))
              }
              min="1"
              className="w-16 p-2 border border-gray-300 rounded-md text-center"
              disabled={!canAddToCart}
            />
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed relative group/tooltip"
            >
              Add to Cart
              {!canAddToCart && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity">
                  Please log in as a customer
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicineListPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMedicines();
        setMedicines(data);
      } catch (err) {
        setError("Could not fetch medicines. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        Loading medicines...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Medicine & Health Products
        </h1>
        <input
          type="text"
          placeholder="Search for a medicine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((med) => (
            <MedicineCard key={med.product_id} medicine={med} />
          ))
        ) : (
          <p>No medicines found.</p>
        )}
      </div>
    </div>
  );
};

export default MedicineListPage;
