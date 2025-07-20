import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient'; // Assuming apiClient is updated with mock data

// Mock data directly in the component for now
const mockMedicines = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief', price: 15000, image: 'https://placehold.co/400x400/d1fae5/10b981?text=Paracetamol', description: 'Effective relief from pain and fever.' },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotics', price: 55000, image: 'https://placehold.co/400x400/d1fae5/10b981?text=Amoxicillin', description: 'Treats a wide range of bacterial infections.' },
  { id: 3, name: 'Loratadine 10mg', category: 'Allergy', price: 32000, image: 'https://placehold.co/400x400/d1fae5/10b981?text=Loratadine', description: 'Non-drowsy antihistamine for allergy relief.' },
  { id: 4, name: 'Vitamin C 1000mg', category: 'Supplements', price: 120000, image: 'https://placehold.co/400x400/d1fae5/10b981?text=Vitamin+C', description: 'Supports immune system health.' },
  { id: 5, name: 'Omeprazole 20mg', category: 'Digestion', price: 75000, image: 'https://placehold.co/400x400/d1fae5/10b981?text=Omeprazole', description: 'Treats heartburn and acid reflux.' },
  { id: 6, name: 'Salbutamol Inhaler', category: 'Asthma', price: 95000, image: 'https://placehold.co/400x400/d1fae5/10b981?text=Inhaler', description: 'Provides fast relief from asthma symptoms.' },
];

const MedicineCard = ({ medicine }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-all duration-300">
    <Link to={`/medicines/${medicine.id}`}>
      <img src={medicine.image} alt={medicine.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 rounded-full uppercase font-semibold tracking-wide">{medicine.category}</span>
        <h3 className="font-bold text-lg mt-2 text-gray-800">{medicine.name}</h3>
        <p className="text-gray-600 text-sm mt-1">{medicine.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-teal-600 font-bold text-xl">{medicine.price.toLocaleString('vi-VN')} VND</p>
          <button className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Add to Cart</button>
        </div>
      </div>
    </Link>
  </div>
);


const MedicineListPage = () => {
  // In a real app, you would fetch this data
  const [medicines, setMedicines] = useState(mockMedicines);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  const filteredMedicines = medicines
    .filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(med => category === 'All' || med.category === category);

  const categories = ['All', ...new Set(mockMedicines.map(m => m.category))];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Medicine & Health Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text"
            placeholder="Search for a medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedicines.map(med => <MedicineCard key={med.id} medicine={med} />)}
      </div>
    </div>
  );
};

export default MedicineListPage;
