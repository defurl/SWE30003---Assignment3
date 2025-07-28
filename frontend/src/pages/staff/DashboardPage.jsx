import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import OperationMenu from '../../components/dashboard/OperationMenu.jsx';
import OrderValidationQueue from '../../components/dashboard/OrderValidationQueue.jsx';
import PaymentVerificationQueue from '../../components/dashboard/PaymentVerificationQueue.jsx';
import apiClient from '../../api/apiClient';

const QuickStatCard = ({ title, value, color = 'text-blue-600' }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-600">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
);

const DashboardPage = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        if (user) {
            apiClient.getDashboardData(user.role).then(setDashboardData);
        }
    }, [user]);

    return (
        <div className="bg-slate-100 flex-grow">
            <div className="container mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Staff Dashboard</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Welcome, <span className="font-semibold text-blue-600">{user.name}</span> | Role: <span className="font-semibold capitalize bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{user.role.replace(/([A-Z])/g, ' $1')}</span>
                    </p>
                </div>
            

                {/* --- CONDITIONAL RENDERING FOR PHARMACIST --- */}
                {user.role === 'pharmacist' && (
                    <div className="mt-10">
                         <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Validation Queue</h2>
                        <OrderValidationQueue /> {/* <-- USE NEW COMPONENT */}
                    </div>
                )}

                {user.role === 'cashier' && (
                    <div className="mt-10">
                         <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Verification Queue</h2>
                        <PaymentVerificationQueue />
                    </div>
                )}

                <div className="mt-10">
                    <OperationMenu role={user.role} />
                    <h2>This is not developed and is only for display purpose</h2>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
