import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import OperationMenu from '../../components/dashboard/OperationMenu.jsx';
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
                
                {/* Quick Stats Section */}
                {dashboardData && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">At a Glance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           {Object.entries(dashboardData.quickStats).map(([title, value]) => (
                               <QuickStatCard key={title} title={title} value={value} />
                           ))}
                        </div>
                    </div>
                )}

                {/* Operations Menu Section */}
                <OperationMenu role={user.role} />
            </div>
        </div>
    );
};

export default DashboardPage;
