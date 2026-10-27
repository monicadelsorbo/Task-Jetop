import { useState, useEffect, useCallback } from 'react';

function getFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category') || 'Tutte',
    difficulty: params.get('difficulty') || 'Tutte',
    q: params.get('q') || '',
    sort: params.get('sort') || 'newest'
  };
}

export function useUrlFilters() {
  const [filters, setFilters] = useState(getFiltersFromUrl);

  useEffect(() => {
    const handlePopState = () => {
      setFilters(getFiltersFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateFilters = useCallback((newPartialFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newPartialFilters };

      // PARTIAMO DAI PARAMETRI ATTUALI PER CONSERVARE ?user= (UB-07)
      const params = new URLSearchParams(window.location.search);

      if (updated.category && updated.category !== 'Tutte') {
        params.set('category', updated.category);
      } else {
        params.delete('category');
      }

      if (updated.difficulty && updated.difficulty !== 'Tutte') {
        params.set('difficulty', updated.difficulty);
      } else {
        params.delete('difficulty');
      }

      if (updated.q && updated.q.trim() !== '') {
        params.set('q', updated.q);
      } else {
        params.delete('q');
      }

      if (updated.sort && updated.sort !== 'newest') {
        params.set('sort', updated.sort);
      } else {
        params.delete('sort');
      }

      const queryString = params.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

      window.history.pushState(null, '', newUrl);

      return updated;
    });
  }, []);

  return [filters, updateFilters];
}