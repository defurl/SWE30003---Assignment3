import React from "react";
import { useAuth } from "../../hooks/useAuth";
import OrderValidationQueue from "../../components/dashboard/OrderValidationQueue.jsx";
import PaymentVerificationQueue from "../../components/dashboard/PaymentVerificationQueue.jsx";
import PerformanceReport from "../../components/dashboard/PerformanceReport.jsx";
import WarehouseDashboard from "../../components/dashboard/WarehouseDashboard.jsx";

const DashboardPage = () => {
  const { user } = useAuth();

  console.log(user)

  const renderMainComponent = () => {
    switch (user.role) {
      case "pharmacist":
        return <OrderValidationQueue />;
      case "cashier":
        return <PaymentVerificationQueue />;
      case "branchManager":
        return <PerformanceReport />;
      case "warehousePersonnel":
        return <WarehouseDashboard />;
      default:
        return <p>No specific dashboard for this role.</p>;
    }
  };

  return (
    <div className="bg-slate-100 flex-grow">
      <div className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Staff Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome,{" "}
            <span className="font-semibold text-blue-600">{user.name}</span> |
            Role:{" "}
            <span className="font-semibold capitalize bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {user.role.replace(/([A-Z])/g, " $1")}
            </span> |
            <span className="text-gray-500">
              {user.branchId ? ` Branch: ${user.branchId}` : " No branch assigned"}
            </span>
          </p>
        </div>

        {renderMainComponent()}
      </div>
    </div>
  );
};

export default DashboardPage;
