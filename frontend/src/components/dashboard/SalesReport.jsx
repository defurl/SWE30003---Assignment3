import React, { useState } from "react";
import apiClient from "../../api/apiClient";

const StatCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

const SalesReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReportData(null);
    try {
      const data = await apiClient.generateSalesReport(startDate, endDate);
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
        Generate Sales Report
      </h2>

      <form
        onSubmit={handleGenerateReport}
        className="flex items-end gap-4 mb-6 pb-6 border-b"
      >
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
            Report for {startDate} to {endDate}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Revenue"
              value={`${parseInt(
                reportData.summary.totalRevenue
              ).toLocaleString("vi-VN")} VND`}
            />
            <StatCard
              title="Total Orders"
              value={reportData.summary.totalOrders}
            />
            <StatCard
              title="Average Order Value"
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
        </div>
      )}
    </div>
  );
};

export default SalesReport;
