import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/apiClient';

const UploadPrescription = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setMessage('Please select a file to upload.');
            return;
        }
        try {
            setUploading(true);
            setMessage('Uploading...');
            const response = await apiClient.uploadPrescription(selectedFile);
            setMessage(response.message);
            setSelectedFile(null);
            // Clear the file input
            e.target.reset(); 
            if (onUploadSuccess) {
                onUploadSuccess(); // Callback to refresh the parent component's data
            }
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload New Prescription</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded-md mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
                {message && <p className="mt-4 text-sm text-center">{message}</p>}
            </form>
        </div>
    );
};

// The rest of the ProfilePage component remains the same...
const ProfilePage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        if (user) {
            try {
                setLoading(true);
                const data = await apiClient.getCustomerProfile();
                setProfileData(data);
            } catch (err) {
                // handle error
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    if (loading) return <div className="container mx-auto p-6">Loading...</div>;
    if (!profileData) return <div className="container mx-auto p-6">Could not load profile.</div>;

    const { details, orderHistory, prescriptions } = profileData;

    return (
        <div className="bg-slate-50 flex-grow">
            <div className="container mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                            <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
                            <div className="space-y-3 text-gray-700">
                                <div><span className="font-semibold text-gray-900">Name:</span> {details.first_name} {details.last_name}</div>
                                <div><span className="font-semibold text-gray-900">Email:</span> {details.email}</div>
                            </div>
                        </div>
                        <UploadPrescription onUploadSuccess={fetchProfile} />
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">My Prescriptions</h2>
                            <p>{prescriptions.length} prescription(s) on file.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Order History</h2>
                            <p>{orderHistory.length} order(s) in history.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
