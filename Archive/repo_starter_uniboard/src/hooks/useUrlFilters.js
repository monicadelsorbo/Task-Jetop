import { useState, useEffect, useCallback, useRef } from 'react';

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
  const filtersRef = useRef(filters);

  // Sincronizza lo stato se l'utente naviga con i tasti Indietro/Avanti del browser (UB-06)
  useEffect(() => {
    const handlePopState = () => {
      const fromUrl = getFiltersFromUrl();
      filtersRef.current = fromUrl;
      setFilters(fromUrl);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateFilters = useCallback((partial) => {
    const updated = { ...filtersRef.current, ...partial };
    filtersRef.current = updated;
    setFilters(updated);

    const params = new URLSearchParams(window.location.search); // conserva ?user=

    const setOrDelete = (key, value, defaultValue) => {
      if (value && value.trim() !== '' && value !== defaultValue) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };

    setOrDelete('category', updated.category, 'Tutte');
    setOrDelete('difficulty', updated.difficulty, 'Tutte');
    setOrDelete('q', updated.q, '');
    setOrDelete('sort', updated.sort, 'newest');

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    const current = window.location.pathname + window.location.search;
    if (newUrl === current) return; // Evita di aggiungere voci duplicate se l'URL non cambia

    // Se si sta digitando nella barra di ricerca ('q'), usiamo replaceState
    // per evitare di riempire la cronologia ad ogni singola lettera (UB-06)
    const onlyQuery = Object.keys(partial).length === 1 && 'q' in partial;
    window.history[onlyQuery ? 'replaceState' : 'pushState'](null, '', newUrl);
  }, []);

  return [filters, updateFilters];
}