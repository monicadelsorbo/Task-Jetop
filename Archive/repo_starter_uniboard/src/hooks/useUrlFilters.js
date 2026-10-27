import { useState } from 'react';

export const DEFAULT_FILTERS = { category: 'Tutte', difficulty: 'Tutte', q: '', sort: 'newest' };

// Legge i filtri dalla query string (es. ?category=Mobile&q=react)
function readFiltersFromUrl() {
  const filters = { ...DEFAULT_FILTERS };
  window.location.search
    .slice(1)
    .split('&')
    .filter(Boolean)
    .forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key in DEFAULT_FILTERS) {
        filters[key] = decodeURIComponent(value);
      }
    });
  return filters;
}

// Scrive nella query string solo i filtri diversi dal default, così il link è condivisibile
function writeFiltersToUrl(filters) {
  const query = Object.entries(filters)
    .filter(([key, value]) => value !== DEFAULT_FILTERS[key])
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  window.history.pushState(null, '', query ? `?${query}` : window.location.pathname);
}

// Stato dei filtri sincronizzato con l'URL: copiando il link si condivide la ricerca.
export function useUrlFilters() {
  const [filters, setFilters] = useState(readFiltersFromUrl);

  const updateFilters = (changes) => {
    const next = { ...filters, ...changes };
    setFilters(next);
    writeFiltersToUrl(next);
  };

  return [filters, updateFilters];
}
