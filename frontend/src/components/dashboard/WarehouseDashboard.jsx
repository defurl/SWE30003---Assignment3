import React, { useState } from "react";
import FulfillmentQueue from "./FulfillmentQueue.jsx";
import StockManagement from "./StockManagement.jsx";

const WarehouseDashboard = () => {
  const [activeTab, setActiveTab] = useState("fulfillment");

  const tabClass = (tabName) =>
    `px-6 py-3 font-semibold rounded-t-lg cursor-pointer transition-colors ${
      activeTab === tabName
        ? "bg-white text-blue-600"
        : "bg-transparent text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("fulfillment")}
            className={tabClass("fulfillment")}
          >
            Fulfillment queue
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={tabClass("stock")}
          >
            Stock management
          </button>
        </nav>
      </div>

      <div>
        {activeTab === "fulfillment" && <FulfillmentQueue />}
        {activeTab === "stock" && <StockManagement />}
      </div>
    </div>
  );
};

export default WarehouseDashboard;
