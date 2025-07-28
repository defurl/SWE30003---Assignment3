import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';

const MedicineDetailPage = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMedicineById(id);
        setMedicine(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-6 py-8 text-center">Loading...</div>;
  }

  if (error || !medicine) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p className="text-gray-600">{error || 'Medicine not found.'}</p>
        <Link to="/medicines" className="text-blue-600 hover:underline mt-4 inline-block">Back to all medicines</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img 
              src={`https://placehold.co/600x600/e0f2f1/00796b?text=${medicine.name.replace(/\s/g, '+')}`} 
              alt={medicine.name} 
              className="w-full rounded-lg" 
            />
          </div>
          <div>
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full uppercase font-semibold tracking-wide">
              {medicine.requires_prescription ? 'Prescription Required' : 'Over-the-Counter'}
            </span>
            <h1 className="text-4xl font-bold text-gray-800 mt-4">{medicine.name}</h1>
            <p className="text-gray-600 mt-4 text-lg">{medicine.description}</p>
            <p className="text-blue-600 font-bold text-3xl mt-6">{parseInt(medicine.price).toLocaleString('vi-VN')} VND</p>
            <div className="mt-8">
              <button className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailPage;
