import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useCart } from '@renderer/hooks/useCart';
import { useProducts } from '@renderer/hooks/useProducts';
import { useKeyboardShortcuts } from '@renderer/hooks/useKeyboardShortcuts';
import CategoryTabs, { CATEGORIES } from '@renderer/components/cashier/CategoryTabs';
import SearchBar from '@renderer/components/cashier/SearchBar';
import ProductGrid from '@renderer/components/cashier/ProductGrid';
import CartPanel from '@renderer/components/cashier/CartPanel';
import CustomerTierSelector from '@renderer/components/cashier/CustomerTierSelector';
import AIRecommendations from '@renderer/components/cashier/AIRecommendations';
import CartTotals from '@renderer/components/cashier/CartTotals';
import PaymentPanel from '@renderer/components/cashier/PaymentPanel';
import type { PaymentData } from '@renderer/components/cashier/PaymentPanel';
import SuccessOverlay from '@renderer/components/cashier/SuccessOverlay';
import type { Product } from '@shared/types';
import { api } from '@renderer/lib/api';

const CashierView: React.FC = () => {
  const searchRef = useRef<HTMLInputElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);
  const [gridDimensions, setGridDimensions] = useState({ width: 400, height: 500 });
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');
  const [lastChangeDue, setLastChangeDue] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const {
    items,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    customerTier,
    customerName,
    addItem,
    removeItem,
    updateQty,
    updateDiscount,
    setCustomerTier,
    setCustomerName,
    clear,
    saveDraft,
  } = useCart();

  const {
    filteredProducts,
    products,
    category,
    searchQuery,
    setCategory,
    setSearchQuery,
  } = useProducts();

  // Resize observer for the product grid
  useEffect(() => {
    const el = productGridRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGridDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleProductClick = useCallback(
    (product: Product) => {
      if (product.stock === 0) return;
      addItem(product);
    },
    [addItem]
  );

  const handleProcessPayment = useCallback(
    async (paymentData: PaymentData) => {
      if (items.length === 0) return;
      setProcessing(true);

      try {
        const orderPayload = {
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            discount: item.discount,
            total: item.product.price * item.quantity * (1 - item.discount / 100),
          })),
          subtotal,
          tax: taxAmount,
          discount: discountAmount,
          total,
          paymentMethod: paymentData.method,
          customerId: paymentData.customerName || null,
          cashierId: 'system',
        };

        const response = await api.post<{ orderNumber: string }>('/orders', orderPayload);

        if (response.success && response.data) {
          setLastOrderNumber(response.data.orderNumber);
          setLastTotal(total);
          setLastChangeDue(paymentData.changeDue || 0);
          setShowSuccess(true);
          clear();
        }
      } catch {
        // Error handled silently, user can retry
      } finally {
        setProcessing(false);
      }
    },
    [items, subtotal, taxAmount, discountAmount, total, clear]
  );

  const handleNewSale = useCallback(() => {
    setShowSuccess(false);
    clear();
  }, [clear]);

  const handlePrintReceipt = useCallback(() => {
    // Print receipt - in real app would trigger print dialog
    window.print();
  }, []);

  const handleClearCart = useCallback(() => {
    if (items.length > 0) {
      setShowClearConfirm(true);
    }
  }, [items.length]);

  const confirmClear = useCallback(() => {
    clear();
    setShowClearConfirm(false);
  }, [clear]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: () => searchRef.current?.focus(),
    onEscape: () => {
      setShowClearConfirm(false);
      setShowSuccess(false);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
    onEnter: () => {
      if (showSuccess) {
        handleNewSale();
      }
    },
    onCategorySelect: (index) => {
      if (index < CATEGORIES.length) {
        setCategory(CATEGORIES[index]);
      }
    },
    onQuantitySelect: () => {
      // Quantity shortcuts - could be used for quick quantity set
    },
    onNewSale: handleNewSale,
    onPrint: handlePrintReceipt,
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-apex-border bg-apex-surface flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-heading font-semibold text-apex-text-primary">
            {'\uD83D\uDED2'} Cashier
          </h1>
          <span className="text-[10px] text-apex-text-muted px-2 py-0.5 rounded bg-apex-elevated border border-apex-border">
            {items.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveDraft}
            className="px-3 py-1.5 text-xs font-medium text-apex-text-secondary hover:text-apex-text-primary border border-apex-border rounded-lg hover:bg-apex-elevated transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleClearCart}
            className="px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </header>

      {/* Three panel layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - Product Grid (35%) */}
        <section className="w-[35%] flex flex-col border-r border-apex-border">
          <div className="p-3 space-y-3 flex-shrink-0">
            <SearchBar ref={searchRef} value={searchQuery} onChange={setSearchQuery} />
            <CategoryTabs selected={category} onSelect={setCategory} />
          </div>
          <div ref={productGridRef} className="flex-1 px-3 pb-3 overflow-hidden">
            <ProductGrid
              products={filteredProducts}
              searchQuery={searchQuery}
              onProductClick={handleProductClick}
              width={gridDimensions.width}
              height={gridDimensions.height}
            />
          </div>
        </section>

        {/* CENTER PANEL - Live Cart (35%) */}
        <section className="w-[35%] flex flex-col border-r border-apex-border bg-apex-surface/30">
          <div className="p-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-heading font-semibold text-apex-text-primary">Live Cart</h2>
              <CustomerTierSelector selected={customerTier} onSelect={setCustomerTier} />
            </div>
          </div>
          <div className="flex-1 px-3 overflow-hidden flex flex-col">
            <CartPanel
              items={items}
              onUpdateQty={updateQty}
              onUpdateDiscount={updateDiscount}
              onRemoveItem={removeItem}
            />
            <AIRecommendations
              cartItems={items}
              allProducts={products}
              onAddProduct={addItem}
            />
            <CartTotals
              subtotal={subtotal}
              discountAmount={discountAmount}
              taxAmount={taxAmount}
              total={total}
            />
          </div>
        </section>

        {/* RIGHT PANEL - Payment (30%) */}
        <section className="w-[30%] p-4">
          <PaymentPanel
            total={total}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            onProcessPayment={handleProcessPayment}
            processing={processing}
          />
        </section>
      </main>

      {/* Success overlay */}
      <SuccessOverlay
        visible={showSuccess}
        orderNumber={lastOrderNumber}
        total={lastTotal}
        changeDue={lastChangeDue}
        onPrintReceipt={handlePrintReceipt}
        onNewSale={handleNewSale}
      />

      {/* Clear cart confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-apex-elevated border border-apex-border rounded-xl p-6 w-[320px] text-center shadow-2xl">
            <p className="text-4xl mb-3">{'\u26A0\uFE0F'}</p>
            <h3 className="text-base font-heading font-semibold text-apex-text-primary mb-2">
              Clear Cart?
            </h3>
            <p className="text-sm text-apex-text-muted mb-5">
              This will remove all {items.length} items from your cart.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-apex-border text-sm font-medium text-apex-text-secondary hover:bg-apex-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="flex-1 py-2 rounded-lg bg-red-500/90 text-white text-sm font-medium hover:bg-red-500 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierView;
