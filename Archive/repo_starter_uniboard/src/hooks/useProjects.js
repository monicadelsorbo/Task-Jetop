import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const PAGE_SIZE = 6;

// =========================================================================
// 🐛 UB-01 / UB-02 / UB-04 (Data Fetching, Join Relazionale e Filtri):
// Analizzate cosa succede quando cambiano i filtri e come viene costruita
// la query verso Supabase (inclusa la relazione con `project_applications`).
// Attenzione: con VITE_SIMULATE_SLOW_NETWORK=true le risposte arrivano in
// ritardo e in ordine casuale. Cambiate categoria velocemente più volte:
// i progetti mostrati corrispondono sempre al filtro selezionato?
// =========================================================================

// Carica i progetti (con le candidature) a pagine di PAGE_SIZE elementi.
export function useProjects({ category, difficulty }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchProjects(0);
  }, []);

  async function fetchProjects(pageToLoad) {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Vogliamo caricare i progetti insieme alle relative candidature (tabella project_applications)
      let query = supabase
        .from('projects')
        .select('*, project_applications(*)')
        .eq('category', category.toLowerCase())
        .order('created_at', { ascending: false })
        .range(pageToLoad * PAGE_SIZE, (pageToLoad + 1) * PAGE_SIZE);

      if (difficulty !== 'Tutte') {
        query = query.eq('difficulty', difficulty.toUpperCase());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Errore Supabase fetchProjects:', error);
        setErrorMsg(error.message);
      } else {
        setProjects((prev) => [...prev, ...(data || [])]);
        setHasMore((data || []).length > 0);
      }
    } catch (err) {
      console.error('Eccezione in fetchProjects:', err);
      setErrorMsg('Errore imprevisto nel caricamento dei dati.');
    } finally {
      setLoading(false);
    }
  }

  // Bottone "Carica altri": richiede la pagina successiva e la accoda alla lista
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProjects(nextPage);
  };

  return { projects, setProjects, loading, errorMsg, hasMore, loadMore };
}
