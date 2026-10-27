import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const simulateSlowNetwork = import.meta.env.VITE_SIMULATE_SLOW_NETWORK === 'true';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Attenzione: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY mancanti nel file .env!'
  );
}

// Simula una rete mobile instabile: ogni richiesta impiega tra 0,2 e 1,8 secondi,
// quindi le risposte possono arrivare in ordine diverso da quello di invio.
// Vincolo di progetto: NON disattivatela, l'app deve funzionare anche così.
const slowFetch = async (...args) => {
  const delay = 200 + Math.random() * 1600;
  await new Promise((resolve) => setTimeout(resolve, delay));
  return fetch(...args);
};

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  simulateSlowNetwork ? { global: { fetch: slowFetch } } : {}
);
