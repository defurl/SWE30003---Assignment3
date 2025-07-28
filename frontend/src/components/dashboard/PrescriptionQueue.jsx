import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const PrescriptionQueue = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRx, setSelectedRx] = useState(null);
    const [notes, setNotes] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    const fetchPending = async () => {
        try {
            setLoading(true);
            setError('');
            setActionMessage('');
            const data = await apiClient.getPendingPrescriptions();
            setPrescriptions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleValidate = async (status) => {
        if (!selectedRx) return;
        try {
            const response = await apiClient.validatePrescription(selectedRx.prescription_id, status, notes);
            setActionMessage(response.message);
            // Refresh the list after validation
            fetchPending();
            setSelectedRx(null);
            setNotes('');
        } catch (err) {
            setActionMessage(`Error: ${err.message}`);
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading prescription queue...</p>;
    if (error) return <p className="text-center text-red-500">Error: {error}</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Prescription List Column */}
            <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-4 border-b pb-2">Pending Validation ({prescriptions.length})</h3>
                <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {prescriptions.length > 0 ? prescriptions.map(rx => (
                        <li 
                            key={rx.prescription_id}
                            onClick={() => { setSelectedRx(rx); setActionMessage(''); }}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${selectedRx?.prescription_id === rx.prescription_id ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'}`}
                        >
                            <p className="font-semibold">Prescription #{rx.prescription_id}</p>
                            <p className="text-sm text-gray-600">Customer: {rx.first_name} {rx.last_name}</p>
                            <p className="text-xs text-gray-400">Received: {new Date(rx.uploaded_at).toLocaleString()}</p>
                        </li>
                    )) : <p className="text-gray-500 p-3">No pending prescriptions.</p>}
                </ul>
            </div>

            {/* Validation Panel Column */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                {selectedRx ? (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Reviewing Prescription #{selectedRx.prescription_id}</h3>
                        <div className="mb-4 border rounded-lg p-2 bg-gray-50">
                            <img src={`http://localhost:5000${selectedRx.image_url}`} alt={`Prescription ${selectedRx.prescription_id}`} className="w-full rounded-md" />
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add validation notes (optional)..."
                            className="w-full p-2 border rounded-md mb-4 focus:ring-2 focus:ring-blue-500"
                            rows="3"
                        ></textarea>
                        <div className="flex gap-4">
                            <button onClick={() => handleValidate('approved')} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                Approve
                            </button>
                            <button onClick={() => handleValidate('rejected')} className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors">
                                Reject
                            </button>
                        </div>
                        {actionMessage && <p className="mt-4 text-sm text-center font-semibold">{actionMessage}</p>}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a prescription from the queue to review.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrescriptionQueue;
