import React from 'react';

const ManagerDashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <header className="h-14 flex items-center justify-between px-6 border-b border-apex-border bg-apex-surface">
        <h1 className="text-lg font-heading font-semibold">Manager Dashboard</h1>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        <p className="text-apex-text-secondary">Dashboard metrics and charts will be rendered here.</p>
      </main>
    </div>
  );
};

export default ManagerDashboard;
