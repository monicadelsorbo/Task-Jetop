// Identità "leggera" senza autenticazione: un ID casuale salvato in localStorage.
// Per simulare un secondo utente aprite l'app con ?user=nome
// (es. http://localhost:5173/?user=giulia) in un'altra scheda.
const STORAGE_KEY = 'uniboard_user_id';

export function getCurrentUserId() {
  const fromQuery = new URLSearchParams(window.location.search).get('user');
  if (fromQuery && fromQuery.trim()) return fromQuery.trim();

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
