import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Inventory from '../modules/Inventory/Inventory';
import CRM from '../modules/CRM/CRM';
import Sales from '../modules/Sales/Sales';
import Scheduling from '../modules/Scheduling/Scheduling';
import Reports from '../modules/Reports/Reports';
import Settings from '../modules/Settings/Settings';

const Layout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Inventory />} />
        </Routes>
      </main>
    </div>
  );
};

export default Layout;
