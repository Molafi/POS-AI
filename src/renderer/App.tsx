import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CashierView from './pages/CashierView';
import ManagerDashboard from './pages/ManagerDashboard';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-apex-base text-apex-text-primary font-body overflow-hidden">
      <Routes>
        <Route path="/" element={<Navigate to="/cashier" replace />} />
        <Route path="/cashier" element={<CashierView />} />
        <Route path="/dashboard" element={<ManagerDashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
};

export default App;
