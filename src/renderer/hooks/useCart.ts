import { useState, useCallback, useRef, useEffect } from 'react';
import type { CartItem, Product } from '@shared/types';
import { api } from '@renderer/lib/api';

export type CustomerTierType = 'new' | 'regular' | 'vip';

interface CartState {
  items: CartItem[];
  customerTier: CustomerTierType;
  customerName: string;
}

interface UseCartReturn {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  customerTier: CustomerTierType;
  customerName: string;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  setCustomerTier: (tier: CustomerTierType) => void;
  setCustomerName: (name: string) => void;
  clear: () => void;
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<void>;
  itemCount: number;
}

const TAX_RATE = 0.16;

function calculateLineTotal(item: CartItem): number {
  const discountMultiplier = 1 - item.discount / 100;
  return item.product.price * item.quantity * discountMultiplier;
}

function getTierDiscount(tier: CustomerTierType): number {
  switch (tier) {
    case 'regular':
      return 5;
    case 'vip':
      return 10;
    default:
      return 0;
  }
}

export function useCart(): UseCartReturn {
  const [state, setState] = useState<CartState>({
    items: [],
    customerTier: 'new',
    customerName: '',
  });
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-save every 30s
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (state.items.length > 0) {
        api.post('/cart/save-draft', {
          items: state.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            discount: item.discount,
          })),
          customerTier: state.customerTier,
        });
      }
    }, 30000);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [state.items, state.customerTier]);

  const addItem = useCallback((product: Product) => {
    setState((prev) => {
      const existing = prev.items.find((item) => item.product.id === product.id);
      if (existing) {
        const updated = prev.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: calculateLineTotal({ ...item, quantity: item.quantity + 1 }) }
            : item
        );
        return { ...prev, items: updated };
      }
      const newItem: CartItem = {
        product,
        quantity: 1,
        discount: 0,
        total: product.price,
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.product.id !== productId),
    }));
  }, []);

  const updateQty = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) return;
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity, total: calculateLineTotal({ ...item, quantity }) }
          : item
      ),
    }));
  }, []);

  const updateDiscount = useCallback((productId: string, discount: number) => {
    const clampedDiscount = Math.min(100, Math.max(0, discount));
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product.id === productId
          ? { ...item, discount: clampedDiscount, total: calculateLineTotal({ ...item, discount: clampedDiscount }) }
          : item
      ),
    }));
  }, []);

  const setCustomerTier = useCallback((tier: CustomerTierType) => {
    setState((prev) => ({ ...prev, customerTier: tier }));
  }, []);

  const setCustomerName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, customerName: name }));
  }, []);

  const clear = useCallback(() => {
    setState({ items: [], customerTier: 'new', customerName: '' });
  }, []);

  const saveDraft = useCallback(async () => {
    await api.post('/cart/save-draft', {
      items: state.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        discount: item.discount,
      })),
      customerTier: state.customerTier,
    });
  }, [state.items, state.customerTier]);

  const loadDraft = useCallback(async () => {
    const response = await api.get<{ items: Array<{ productId: string; quantity: number; discount: number }>; customerTier: CustomerTierType } | null>('/cart/draft');
    if (response.success && response.data) {
      // We would need products to reconstruct; for now just set tier
      setState((prev) => ({ ...prev, customerTier: response.data?.customerTier || 'new' }));
    }
  }, []);

  // Calculate totals
  const subtotal = state.items.reduce((sum, item) => {
    const discountMultiplier = 1 - item.discount / 100;
    return sum + item.product.price * item.quantity * discountMultiplier;
  }, 0);

  const tierDiscountPercent = getTierDiscount(state.customerTier);
  const discountAmount = subtotal * (tierDiscountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * TAX_RATE;
  const total = taxableAmount + taxAmount;

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: state.items,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    customerTier: state.customerTier,
    customerName: state.customerName,
    addItem,
    removeItem,
    updateQty,
    updateDiscount,
    setCustomerTier,
    setCustomerName,
    clear,
    saveDraft,
    loadDraft,
    itemCount,
  };
}
