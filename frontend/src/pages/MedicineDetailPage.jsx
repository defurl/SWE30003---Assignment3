import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const MedicineDetailPage = () => {
  const { id } = useParams();

  const { isAuthenticated, user } = useAuth();

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useCart();
  const navigate = useNavigate();


  const addProductToCart = () => {
    if (!medicine) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if(user.role !== "customer") return;

    addToCart(medicine);
  };

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
          <div className="">
            <Link
              to="/medicines"
              className="top-4 left-4 py-2 flex text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg> Back to list
            </Link>
            
          </div>
          
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
              {
                (isAuthenticated && user.role === "customer") ? (
                  <button onClick={addProductToCart} className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                    Add to Cart
                  </button>
                ) : (!user ? (<>
                    <div className="p-4 mb-4 text-md text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                      <span className="font-medium">Sign-in required</span> 
                      <br></br>
                      Please sign in to add this medicine to your cart.
                    </div>
                    
                    <button onClick={() => navigate('/login')} className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                      Sign in
                    </button>
                  </>) : (
                    <>
                      <div className="p-4 mb-4 text-md text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                        <span className="font-medium">Cannot purchased</span>
                        <br></br>
                        You must be logged in as a customer to add this medicine to your cart.
                      </div>

                      <button onClick={() => navigate('/medicines')} className="w-full bg-red-400 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
                        Back to medicine list
                      </button>
                    </>
                  )
                  
                )
              }

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailPage;
