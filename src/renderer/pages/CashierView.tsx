import React from 'react';

const CashierView: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <header className="h-14 flex items-center justify-between px-6 border-b border-apex-border bg-apex-surface">
        <h1 className="text-lg font-heading font-semibold">Cashier</h1>
      </header>
      <main className="flex-1 flex">
        <section className="flex-1 p-6">
          <p className="text-apex-text-secondary">Product grid will be rendered here.</p>
        </section>
        <aside className="w-96 border-l border-apex-border bg-apex-surface p-4">
          <p className="text-apex-text-secondary">Cart will be rendered here.</p>
        </aside>
      </main>
    </div>
  );
};

export default CashierView;
