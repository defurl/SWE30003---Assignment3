import React from 'react';
import { ClipboardCheckIcon, BarChart3Icon, PackagePlusIcon, UsersIcon } from '../common/Icons.jsx';

const OperationCard = ({ title, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
        <div className="bg-blue-100 p-4 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
);

const OperationMenu = ({ role }) => {
    const operations = {
        pharmacist: [
            { name: 'Validate Prescriptions', icon: <ClipboardCheckIcon className="h-8 w-8 text-blue-600" /> },
            { name: 'Manage Medicine Catalog', icon: <PillIcon className="h-8 w-8 text-blue-600" /> },
        ],
        cashier: [
            { name: 'Point of Sale (POS)', icon: <ShoppingCartIcon className="h-8 w-8 text-blue-600" /> },
            { name: 'Process Returns', icon: <LogOutIcon className="h-8 w-8 text-blue-600" /> }, // Placeholder icon
        ],
        branchManager: [
            { name: 'Generate Sales Report', icon: <BarChart3Icon className="h-8 w-8 text-blue-600" /> },
            { name: 'Manage Staff', icon: <UsersIcon className="h-8 w-8 text-blue-600" /> },
        ],
        warehousePersonnel: [
            { name: 'Receive Incoming Stock', icon: <PackagePlusIcon className="h-8 w-8 text-blue-600" /> },
            { name: 'Manage Branch Transfers', icon: <LayoutDashboardIcon className="h-8 w-8 text-blue-600" /> }, // Placeholder icon
        ],
    };

    const menuItems = operations[role] || [];

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Operations Menu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {menuItems.map(item => (
                    <OperationCard key={item.name} title={item.name} icon={item.icon} />
                ))}
            </div>
        </div>
    );
};

// Re-importing icons needed for this component specifically
import { PillIcon, ShoppingCartIcon, LogOutIcon, LayoutDashboardIcon } from '../common/Icons.jsx';

export default OperationMenu;
