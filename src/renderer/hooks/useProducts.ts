import { useState, useEffect, useCallback, useRef } from 'react';
import type { Product } from '@shared/types';
import { api } from '@renderer/lib/api';
import { fuzzySearch } from '@renderer/utils/algorithms';

interface UseProductsReturn {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  category: string;
  searchQuery: string;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') {
        params.set('category', category);
      }
      const endpoint = params.toString() ? `/products?${params}` : '/products';
      const response = await api.get<Product[]>(endpoint);
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.error || 'Failed to load products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced fuzzy search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredProducts(products);
      } else {
        const results = fuzzySearch(products, searchQuery, (p) => p.name);
        setFilteredProducts(results);
      }
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, products]);

  // When products change and no search, update filtered
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);

  return {
    products,
    filteredProducts,
    loading,
    error,
    category,
    searchQuery,
    setCategory,
    setSearchQuery,
    refetch: fetchProducts,
  };
}
