import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const MedicineCard = ({ medicine }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-all duration-300">
    <Link to={`/medicines/${medicine.product_id}`}>
      {/* Using a placeholder image for now */}
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">{medicine.name}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mt-2 text-gray-800">{medicine.name}</h3>
        <p className="text-gray-600 text-sm mt-1 truncate">{medicine.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-blue-600 font-bold text-xl">{parseInt(medicine.price).toLocaleString('vi-VN')} VND</p>
          <button className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Add to Cart</button>
        </div>
      </div>
    </Link>
  </div>
);

const MedicineListPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMedicines();
        setMedicines(data);
      } catch (err) {
        setError('Could not fetch medicines. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []); // The empty dependency array means this effect runs once on component mount.

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="container mx-auto px-6 py-8 text-center">Loading medicines...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-6 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Medicine & Health Products</h1>
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
          filteredMedicines.map(med => <MedicineCard key={med.product_id} medicine={med} />)
        ) : (
          <p>No medicines found.</p>
        )}
      </div>
    </div>
  );
};

export default MedicineListPage;
