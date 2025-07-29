import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../api/apiClient";

const PrescriptionUploadPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }
    try {
      setUploading(true);
      setError("");
      setMessage("Uploading...");

      await apiClient.uploadPrescriptionForOrder(orderId, selectedFile);

      setMessage(
        "Upload successful! Your prescription is now pending review by a pharmacist."
      );
      setTimeout(() => {
        navigate("/profile"); // Redirect to profile page after success
      }, 3000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setMessage("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md relative">
        {/* --- FIX IS HERE: Back arrow link at the top left --- */}
        <Link
          to="/profile"
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Upload Prescription
          </h1>
          <p className="text-gray-600 mb-6">
            For Order{" "}
            <span className="font-semibold font-mono text-blue-600">
              #{orderId}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="text-sm text-center text-gray-500 mb-4">
            Please upload a clear image of your prescription.
          </p>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png"
            className="w-full p-2 border rounded-md mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {uploading ? "Uploading..." : "Submit Prescription"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-center text-red-500">{error}</p>
        )}
        {message && !error && (
          <p className="mt-4 text-sm text-center text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default PrescriptionUploadPage;
