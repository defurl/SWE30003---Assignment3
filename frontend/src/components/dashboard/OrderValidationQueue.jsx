import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const OrderValidationQueue = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await apiClient.getOrderValidationQueue();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleSelectOrder = async (order) => {
        setSelectedOrder(order);
        setLoadingPrescriptions(true);
        setError(''); // Clear previous errors
        
        try {
            console.log('Fetching prescriptions for order:', order.order_id); // Debug log
            const data = await apiClient.getOrderPrescriptions(order.order_id);
            setPrescriptions(data);
        } catch (err) {
            console.error('Error fetching prescriptions:', err); // Debug log
            setError(`Could not fetch prescriptions for order #${order.order_id}: ${err.message}`);
            setPrescriptions([]); // Clear prescriptions on error
        } finally {
            setLoadingPrescriptions(false);
        }
    };

    const handleValidate = async (decision) => {
        if (!selectedOrder) return;
        try {
            await apiClient.validateOrder(selectedOrder.order_id, decision);
            alert(`Order #${selectedOrder.order_id} has been ${decision}.`);
            setSelectedOrder(null);
            setPrescriptions([]);
            fetchQueue(); // Refresh the queue
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading validation queue...</p>;
    if (error && !selectedOrder) return <p className="text-center text-red-500">Error: {error}</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-4 border-b pb-2">Orders Awaiting Validation ({orders.length})</h3>
                <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {orders.length > 0 ? orders.map(order => (
                        <li key={order.order_id} onClick={() => handleSelectOrder(order)} className={`p-3 rounded-md cursor-pointer transition-colors ${selectedOrder?.order_id === order.order_id ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'}`}>
                            <p className="font-semibold">Order #{order.order_id}</p>
                            <p className="text-sm text-gray-600">Customer: {order.first_name} {order.last_name}</p>
                            <p className="text-xs text-gray-400">Received: {new Date(order.order_date).toLocaleString()}</p>
                        </li>
                    )) : <p className="text-gray-500 p-3">No orders are awaiting validation.</p>}
                </ul>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                {selectedOrder ? (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Reviewing Order #{selectedOrder.order_id}</h3>
                        {loadingPrescriptions ? <p>Loading prescriptions...</p> : (
                            <div className="space-y-4 mb-6">
                                {prescriptions.length > 0 ? prescriptions.map(rx => (
                                    <div key={rx.prescription_id} className="border rounded-lg p-2 bg-gray-50">
                                        <img src={`http://localhost:5000${rx.image_url}`} alt={`Prescription ${rx.prescription_id}`} className="w-full rounded-md" />
                                    </div>
                                )) : <p className="text-gray-500">No prescriptions found for this order.</p>}
                            </div>
                        )}
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <div className="flex gap-4">
                            <button onClick={() => handleValidate('approved')} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">Approve Order</button>
                            <button onClick={() => handleValidate('rejected')} className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700">Reject Order</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select an order from the queue to review its prescriptions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderValidationQueue;
