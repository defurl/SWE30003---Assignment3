import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/apiClient';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            apiClient.getCustomerProfile(user.id)
                .then(data => {
                    setProfileData(data);
                    setLoading(false);
                });
        }
    }, [user]);

    if (loading) {
        return <div className="container mx-auto px-6 py-8">Loading...</div>;
    }

    if (!profileData) {
        return <div className="container mx-auto px-6 py-8">Could not load profile.</div>;
    }

    const { details, orderHistory, prescriptions } = profileData;

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-slate-50 flex-grow">
            <div className="container mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Personal Details */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
                        <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
                        <div className="space-y-3">
                            <div><span className="font-semibold">Name:</span> {details.name}</div>
                            <div><span className="font-semibold">Email:</span> {details.email}</div>
                            <div><span className="font-semibold">Phone:</span> {details.phone}</div>
                            <div><span className="font-semibold">Address:</span> {details.address}</div>
                        </div>
                    </div>

                    {/* Order History & Prescriptions */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Order History</h2>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2">Order ID</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderHistory.map(order => (
                                        <tr key={order.id} className="border-b">
                                            <td className="py-3 font-mono text-blue-600">{order.id}</td>
                                            <td>{order.date}</td>
                                            <td>{order.total.toLocaleString('vi-VN')} VND</td>
                                            <td>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">My Prescriptions</h2>
                             <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2">Prescription ID</th>
                                        <th>Medication</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map(rx => (
                                        <tr key={rx.id} className="border-b">
                                            <td className="py-3 font-mono text-blue-600">{rx.id}</td>
                                            <td>{rx.medication}</td>
                                            <td>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(rx.status)}`}>
                                                    {rx.status}
                                                </span>
                                            </td>
                                            <td>{rx.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
