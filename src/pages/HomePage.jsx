import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <div className="bg-teal-50">
        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
            Your Trusted Partner in Health
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            Providing reliable and accessible pharmaceutical care for the community. Search for products, upload prescriptions, and manage your health with ease.
          </p>
          <div className="mt-8">
            <Link 
              to="/medicines" 
              className="bg-teal-600 text-white font-bold py-4 px-10 rounded-full hover:bg-teal-700 transition-transform hover:scale-105 inline-block"
            >
              Browse All Medicines
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Our Services</h2>
            <p className="text-gray-600">Comprehensive care at your fingertips.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Wide Product Range</h3>
              <p className="text-gray-600">Access thousands of medicines and health products from trusted brands.</p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert Pharmacists</h3>
              <p className="text-gray-600">Get professional advice and have your prescriptions validated with care.</p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast & Easy Orders</h3>
              <p className="text-gray-600">Order online for quick delivery or convenient in-store pickup.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
