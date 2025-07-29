import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PillIcon, ShoppingCartIcon, UserIcon, LogOutIcon, LayoutDashboardIcon } from './Icons.jsx';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-3xl font-bold text-blue-600 flex items-center gap-2">
            <img src="/src/assets/longchau-logo.png" alt="Long Chau Logo" className="h-10"/>
          </Link>
          
          
          <div className="flex items-center gap-6">
            {/* --- ROLE-BASED CONDITIONAL RENDERING --- */}

            {/* Show "Medicines" link for customers */}
           {user?.role === 'customer' && (
              <>
                <Link to="/medicines" className="text-gray-700 hover:text-blue-600 transition-colors font-semibold">Home</Link>
              </>
            )}

            {/* ONLY show "Cart" link for customers */}
            {user?.role === 'customer' && (
              <Link to="/order" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                <ShoppingCartIcon />
                <span>Cart</span>
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to={user.role === 'customer' ? '/profile' : '/dashboard'} 
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-semibold"
                >
                  {user.role === 'customer' ? <UserIcon /> : <LayoutDashboardIcon />}
                  <span>{user.name}</span>
                </Link>
                <button onClick={logout} className="text-gray-500 hover:text-red-600 transition-colors">
                  <LogOutIcon />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
