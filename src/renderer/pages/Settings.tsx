import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <header className="h-14 flex items-center justify-between px-6 border-b border-apex-border bg-apex-surface">
        <h1 className="text-lg font-heading font-semibold">Settings</h1>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        <p className="text-apex-text-secondary">Application settings will be rendered here.</p>
      </main>
    </div>
  );
};

export default Settings;
