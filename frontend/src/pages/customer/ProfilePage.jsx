import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import apiClient from "../../api/apiClient";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchProfile = async () => {
    if (user) {
      try {
        setLoading(true);
        const data = await apiClient.getCustomerProfile();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // --- NEW: Memoize rejected prescriptions for efficient lookup ---
  const rejectedPrescriptionsMap = useMemo(() => {
    if (!profileData?.prescriptions) return new Map();

    const map = new Map();
    profileData.prescriptions
      .filter((p) => p.status === "rejected")
      .forEach((p) => {
        map.set(p.order_id, p); // Store the entire prescription object
      });
    return map;
  }, [profileData]);

  const handleInitiatePayment = async (orderId) => {
    setActionMessage("Sending to cashier...");
    try {
      const response = await apiClient.initiatePayment(orderId);
      setActionMessage(response.message);
      fetchProfile();
    } catch (err) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        Loading your profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-6 py-8">Could not load profile.</div>
    );
  }

  const { details, orderHistory } = profileData;

  const getStatusInfo = (order) => {
    // --- NEW: Check for rejected prescription ---
    if (
      order.status === "cancelled" &&
      rejectedPrescriptionsMap.has(order.order_id)
    ) {
      return {
        text: "Prescription Rejected",
        className: "bg-red-100 text-red-800",
      };
    }

    switch (order.status.toLowerCase()) {
      case "completed":
        return { text: "Completed", className: "bg-green-100 text-green-800" };
      case "processing":
        return {
          text: "Processing",
          className: "bg-indigo-100 text-indigo-800",
        };
      case "cancelled":
        return { text: "Cancelled", className: "bg-red-100 text-red-800" };
      case "prescription_declined":
        return { text: "Prescription declined", className: "bg-red-100 text-red-800" };
      case "awaiting_prescription_validation":
        return {
          text: "Awaiting prescription validation",
          className: "bg-blue-100 text-blue-800",
        };
      case "pending_payment":
        return {
          text: "Pending payment",
          className: "bg-blue-100 text-blue-800",
        };
      case "awaiting_verification":
        return {
          text: "Awaiting verification",
          className: "bg-cyan-100 text-cyan-800",
        };
      case "pending_prescription":
        return {
          text: "Pending prescription",
          className: "bg-yellow-100 text-yellow-800",
        };
      default:
        return {
          text: order.status.replace(/_/g, " "),
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  return (
    <div className="bg-slate-50 flex-grow">
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>
        {actionMessage && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
            {actionMessage}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
            <p>
              <strong>Name:</strong> {details.first_name} {details.last_name}
            </p>
            <p>
              <strong>Email:</strong> {details.email}
            </p>
            <p>
              <strong>Phone:</strong> {details.phone_number}
            </p>
            <p>
              <strong>Address:</strong> {details.address}
            </p>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4">Order ID</th>
                      <th className="py-2 px-4">Date</th>
                      <th className="py-2 px-4">Total</th>
                      <th className="py-2 px-4">Status</th>
                      <th className="py-2 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map((order) => {
                      const statusInfo = getStatusInfo(order);
                      const rejectedRx = rejectedPrescriptionsMap.get(
                        order.order_id
                      );

                      return (
                        <tr
                          key={order.order_id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-mono text-blue-600">
                            {order.order_id}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(order.order_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {parseInt(order.total_amount).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VND
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
                            >
                              {statusInfo.text}
                            </span>
                            {rejectedRx && rejectedRx.notes && (
                              <p className="text-xs text-red-600 mt-1 italic">
                                Note: {rejectedRx.notes}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {order.status === "pending_payment" && (
                              <button
                                onClick={() =>
                                  handleInitiatePayment(order.order_id)
                                }
                                className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-green-600"
                              >
                                Pay Now
                              </button>
                            )}
                            {(order.status === "pending_prescription" || order.status == "prescription_declined") && (
                              <Link
                                to={`/order/${order.order_id}/upload-prescription`}
                                className="bg-yellow-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-yellow-600"
                              >
                                Upload Rx
                              </Link>
                            )}
                            {/* --- NEW ACTION FOR REJECTED RX --- */}
                            {rejectedRx && (
                              <Link
                                to={`/order/${order.order_id}/upload-prescription`}
                                className="bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-red-600"
                              >
                                Upload New Rx
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
