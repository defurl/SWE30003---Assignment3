import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const PrescriptionUploadPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }
        try {
            setUploading(true);
            setError('');
            setMessage('Uploading...');
            
            await apiClient.uploadPrescriptionForOrder(orderId, selectedFile);
            
            setMessage('Upload successful! Your prescription is now pending review by a pharmacist.');
            setTimeout(() => {
                navigate('/profile'); // Redirect to profile page after success
            }, 3000);

        } catch (err) {
            setError(`Error: ${err.message}`);
            setMessage('');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-10">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Prescription</h1>
                <p className="text-gray-600 mb-6">Your order <span className="font-semibold font-mono text-blue-600">#{orderId}</span> requires a valid prescription. Please upload a clear image or PDF.</p>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="file"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full p-2 border rounded-md mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button 
                        type="submit" 
                        disabled={uploading} 
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                        {uploading ? 'Uploading...' : `Submit for Order #${orderId}`}
                    </button>
                    {error && <p className="mt-4 text-sm text-center text-red-500">{error}</p>}
                    {message && !error && <p className="mt-4 text-sm text-center text-green-600">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default PrescriptionUploadPage;
