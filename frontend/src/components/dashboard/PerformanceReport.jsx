import React, { useState } from "react";
import apiClient from "../../api/apiClient";

const StatCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

const PerformanceReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reportType, setReportType] = useState("sales");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setReportData(null); // Reset report data when changing type
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReportData(null);
    try {
      let data;
      switch (reportType) {
        case "sales":
          data = await apiClient.generateSalesReport(startDate, endDate);
          break;
        case "pharmacists":
          data = await apiClient.generatePharmacistReport(startDate, endDate);
          break;
        case "delivery":
          data = await apiClient.generateDeliveryReport(startDate, endDate);
          break;
        default:
          throw new Error("Invalid report type");
      }
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Performance reports
      </h2>

      <form
        onSubmit={handleGenerateReport}
        className="flex items-end gap-4 mb-6 pb-6 border-b"
      >
        <div>
          <label
            htmlFor="report-type"
            className="block text-sm font-medium text-gray-700"
          >
            Report Type
          </label>
          <select
            id="report-type"
            value={reportType}
            onChange={(e) => handleReportTypeChange(e)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="sales">Sales report</option>
            <option value="pharmacists">Pharmacist performance</option>
            <option value="delivery">Delivery report</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="end-date"
            className="block text-sm font-medium text-gray-700"
          >
            End Date
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {reportData && (
        <div>
          <h3 className="font-semibold text-xl mb-4">
            {reportType === "sales" && "Sales report"}
            {reportType === "pharmacists" && "Pharmacist performance report"}
            {reportType === "shipment" && "Shipment report"}
            {reportType === "delivery" && "Delivery report"}
            {" "}for {startDate} to {endDate}
          </h3>
          
          {reportType === "sales" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard
                  title="Total revenue"
                  value={`${parseInt(
                    reportData.summary.totalRevenue
                  ).toLocaleString("vi-VN")} VND`}
                />
                <StatCard
                  title="Total orders"
                  value={reportData.summary.totalOrders}
                />
                <StatCard
                  title="Average order value"
                  value={`${parseInt(
                    reportData.summary.averageOrderValue
                  ).toLocaleString("vi-VN")} VND`}
                />
              </div>
              <h4 className="font-semibold text-lg mb-2">Sales by Product</h4>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-2 px-4">Product Name</th>
                    <th className="py-2 px-4">Units Sold</th>
                    <th className="py-2 px-4">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.productSales.map((item) => (
                    <tr key={item.product_id} className="border-b">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.unitsSold}</td>
                      <td className="py-3 px-4">
                        {parseInt(item.productRevenue).toLocaleString("vi-VN")} VND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {reportType === "pharmacists" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Total prescriptions"
                  value={reportData.summary?.totalPrescriptions || 0}
                />
                <StatCard
                  title="No. of approved prescriptions"
                  value={reportData.summary?.approvedPrescriptions || 0}
                />
                <StatCard
                  title="No. of rejected prescriptions"
                  value={reportData.summary?.declinedPrescriptions || 0}
                />
                <StatCard
                  title="Average per pharmacist"
                  value={reportData.summary?.averagePerPharmacist || 0}
                />
              </div>
              <h4 className="font-semibold text-lg mb-2">Pharmacist performance</h4>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">No. of prescriptions processed</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.report?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.pharmacistName}</td>
                      <td className="py-3 px-4">{item.prescriptionsProcessed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {reportType === "delivery" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Total deliveries"
                  value={reportData.totalDeliveries || 0}
                />
                <StatCard
                  title="No. of completed deliveries"
                  value={reportData.statusCounts?.completed || 0}
                />
                <StatCard
                  title="No. of pending deliveries"
                  value={reportData.statusCounts?.pending || 0}
                />
                <StatCard
                  title="No. of preparing deliveries"
                  value={reportData.statusCounts?.preparing || 0}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <StatCard
                  title="No. of home delivery"
                  value={reportData.methodCounts?.home_delivery || 0}
                />
                <StatCard
                  title="No. of completed deliveries"
                  value={reportData.methodCounts?.in_store_pickup || 0}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceReport;
