import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PillIcon, ShoppingCartIcon, UserIcon, LogOutIcon, LayoutDashboardIcon } from './Icons.jsx';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-500 shadow-md sticky top-0 z-50 ">
      <div className="container mx-auto px-6 py-3 bg-blue-500">
        <div className="flex items-center justify-between">
            <img src="src/assets/longchau-logo.png" alt="Long Chau Logo" className="h-10"/>
          
          <div className="flex-1 max-w-xl mx-4">
            <input 
              type="text" 
              placeholder="Tìm sản phẩm, bệnh, thương hiệu..." 
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <Link to="/order" className="flex items-center gap-2 text-white hover:text-blue-600 transition-colors">
              <ShoppingCartIcon />
              <span>Giỏ hàng</span>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to={user.role === 'customer' ? '/profile' : '/dashboard'} 
                  className="flex items-center gap-2 text-white hover:text-blue-600 transition-colors"
                >
                  {user.role === 'customer' ? <UserIcon /> : <LayoutDashboardIcon />}
                  <span>{user.name}</span>
                </Link>
                <button onClick={logout} className="text-white hover:text-red-600 transition-colors">
                  <LogOutIcon />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
