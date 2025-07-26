import React from 'react';
import { Link, useParams } from 'react-router-dom';

// Using the same mock data for demonstration
const mockMedicines = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief', price: 15000, image: 'https://placehold.co/600x600/d1fae5/10b981?text=Paracetamol', description: 'Effective relief from pain and fever associated with conditions like headaches, colds, and flu.' },
  // ... add other medicines if needed for direct navigation
];

const MedicineDetailPage = () => {
  const { id } = useParams();
  // In a real app, you would fetch the medicine by ID
  const medicine = mockMedicines.find(m => m.id === parseInt(id));

  if (!medicine) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <h2 className="text-2xl font-bold">Medicine not found</h2>
        <Link to="/medicines" className="text-teal-600 hover:underline mt-4 inline-block">Back to all medicines</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img src={medicine.image} alt={medicine.name} className="w-full rounded-lg" />
          </div>
          <div>
            <span className="inline-block bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded-full uppercase font-semibold tracking-wide">{medicine.category}</span>
            <h1 className="text-4xl font-bold text-gray-800 mt-4">{medicine.name}</h1>
            <p className="text-gray-600 mt-4 text-lg">{medicine.description}</p>
            <p className="text-teal-600 font-bold text-3xl mt-6">{medicine.price.toLocaleString('vi-VN')} VND</p>
            <div className="mt-8">
              <button className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors">
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
