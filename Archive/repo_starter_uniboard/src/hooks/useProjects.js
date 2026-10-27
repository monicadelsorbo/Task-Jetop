import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const PAGE_SIZE = 6;

// Carica i progetti (con le candidature) a pagine di PAGE_SIZE elementi.
export function useProjects({ category, difficulty }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Ogni volta che cambiano i filtri, ricarichiamo da pagina 0
  useEffect(() => {
    let ignore = false; // Risolve UB-04: evita race condition su rete lenta

    async function loadInitialProjects() {
      setLoading(true);
      setErrorMsg(null);
      setPage(0);

      try {
        // 1. Inizializziamo la query SENZA filtri predefiniti
        let query = supabase
          .from('projects')
          .select('*, project_applications(*)')
          .order('created_at', { ascending: false })
          .range(0, PAGE_SIZE - 1); // 0..5 = 6 elementi

        // 2. Applichiamo la categoria SOLO se non è 'Tutte'
        if (category && category !== 'Tutte') {
          query = query.eq('category', category);
        }

        // 3. Applichiamo la difficoltà SOLO se non è 'Tutte'
        if (difficulty && difficulty !== 'Tutte') {
          query = query.eq('difficulty', difficulty);
        }

        const { data, error } = await query;

        if (ignore) return; // Se il filtro è cambiato nel frattempo, scartiamo la risposta vecchia

        if (error) {
          console.error('Errore Supabase fetchProjects:', error);
          setErrorMsg(error.message);
        } else {
          // SOVRASCRIVIAMO lo stato (non accodiamo) perché siamo a pagina 0
          setProjects(data || []);
          setHasMore((data || []).length === PAGE_SIZE);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Eccezione in fetchProjects:', err);
          setErrorMsg('Errore imprevisto nel caricamento dei dati.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadInitialProjects();

    return () => {
      ignore = true; // Annulla l'effetto della richiesta precedente se l'utente cambia filtro rapidamente
    };
  }, [category, difficulty]);

  // Bottone "Carica altri": richiede la pagina successiva e la accoda alla lista
  const loadMore = async () => {
    const nextPage = page + 1;
    setLoading(true);

    try {
      const from = nextPage * PAGE_SIZE;
      const to = (nextPage + 1) * PAGE_SIZE - 1;

      let query = supabase
        .from('projects')
        .select('*, project_applications(*)')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (category && category !== 'Tutte') {
        query = query.eq('category', category);
      }

      if (difficulty && difficulty !== 'Tutte') {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query;

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Qui ACCODIAMO i nuovi risultati della pagina successiva
        setProjects((prev) => [...prev, ...(data || [])]);
        setPage(nextPage);
        setHasMore((data || []).length === PAGE_SIZE);
      }
    } catch (err) {
      setErrorMsg('Errore durante il caricamento delle pagine successive.');
    } finally {
      setLoading(false);
    }
  };

  return { projects, setProjects, loading, errorMsg, hasMore, loadMore };
}