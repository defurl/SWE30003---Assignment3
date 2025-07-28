import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const PaymentVerificationQueue = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getPaymentQueue();
            setQueue(data);
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
        try {
            const details = await apiClient.getOrderById(order.order_id);
            setOrderDetails(details);
        } catch (err) {
            setError(`Could not fetch details for order #${order.order_id}`);
        }
    };

    const handleConfirm = async () => {
        if (!selectedOrder) return;
        try {
            await apiClient.confirmPayment(selectedOrder.order_id, 'cash'); // Simplified method
            alert(`Payment confirmed for order #${selectedOrder.order_id}.`);
            setSelectedOrder(null);
            setOrderDetails(null);
            fetchQueue(); // Refresh the queue
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading payment queue...</p>;
    if (error && !selectedOrder) return <p className="text-center text-red-500">Error: {error}</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-4 border-b pb-2">Awaiting Verification ({queue.length})</h3>
                <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {queue.map(order => (
                        <li key={order.order_id} onClick={() => handleSelectOrder(order)} className={`p-3 rounded-md cursor-pointer ${selectedOrder?.order_id === order.order_id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                            <p className="font-semibold">Order #{order.order_id}</p>
                            <p className="text-sm text-gray-600">Customer: {order.first_name} {order.last_name}</p>
                            <p className="font-bold text-blue-600">{parseInt(order.total_amount).toLocaleString('vi-VN')} VND</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                {selectedOrder ? (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Verify Payment for Order #{selectedOrder.order_id}</h3>
                        {orderDetails ? (
                            <div className="mb-6 border-t border-b py-4">
                                <h4 className="font-semibold mb-2">Order Items:</h4>
                                {orderDetails.items.map(item => (
                                    <div key={item.order_item_id} className="flex justify-between text-sm">
                                        <span>{item.name} (x{item.quantity})</span>
                                        <span>{parseInt(item.price_per_unit * item.quantity).toLocaleString('vi-VN')} VND</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t">
                                    <span>Total</span>
                                    <span>{parseInt(orderDetails.total_amount).toLocaleString('vi-VN')} VND</span>
                                </div>
                            </div>
                        ) : <p>Loading order details...</p>}
                        <button onClick={handleConfirm} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">
                            Confirm Payment Received
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select an order from the queue to verify payment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentVerificationQueue;
