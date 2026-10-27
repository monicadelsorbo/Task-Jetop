import { useState, useEffect, useCallback } from 'react';

/**
 * Legge i filtri correnti dall'URL del browser.
 */
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

  // Sincronizza lo stato se l'utente naviga con i tasti Indietro/Avanti del browser (UB-06)
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

      // 1. PARTIAMO DAI PARAMETRI ATTUALI PER CONSERVARE ?user=... (UB-07)
      const params = new URLSearchParams(window.location.search);

      // 2. Aggiorniamo o rimuoviamo solo i parametri dei filtri
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

      // 3. Ricostruiamo l'URL mantenendo inalterato il parametro user
      const queryString = params.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

      // 4. Se si sta digitando nella barra di ricerca ('q'), usiamo replaceState
      // per evitare di riempire la cronologia ad ogni singola lettera (UB-06)
      const isOnlyQueryChange = 'q' in newPartialFilters && Object.keys(newPartialFilters).length === 1;

      if (isOnlyQueryChange) {
        window.history.replaceState(null, '', newUrl);
      } else {
        window.history.pushState(null, '', newUrl);
      }

      return updated;
    });
  }, []);

  return [filters, updateFilters];
}

