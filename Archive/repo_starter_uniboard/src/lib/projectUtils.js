// =========================================================================
// Funzioni pure per derivare dati dai progetti (usate da App e dai componenti).
// Le specifiche sono in `projectUtils.test.js`: lanciate `npm test`.
// =========================================================================

// Posti ancora disponibili in un progetto (mai negativo).
export function getSpotsLeft(project) {
  const taken = (project.project_applications || []).length;
  return Math.max(0, project.spots_total - taken);
}

// Le candidature restano aperte fino alla fine del giorno di scadenza (incluso).
// `application_deadline` arriva da Supabase come stringa 'YYYY-MM-DD' (o null).
export function isApplicationOpen(project, now = new Date()) {
  if (!project.application_deadline) return true;
  return new Date(project.application_deadline) >= now;
}

// 🐛 UB-03 (Ricerca testuale):
// La ricerca deve funzionare su titolo, descrizione e tag tecnologici.
// Siete sicuri che "react" trovi un progetto con tag "React"?
export function filterProjects(projects, { searchQuery = '' } = {}) {
  const q = searchQuery.trim();
  if (!q) return projects;

  return projects.filter(
    (p) =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.tech_stack.includes(q)
  );
}

// 🐛 UB-03 (Ordinamento):
// 'newest'    -> created_at decrescente
// 'spots_asc' -> posti LIBERI crescenti (a parità, il più recente prima)
// Provate a passare da "Posti liberi" a "Più recenti": l'ordine torna quello di prima?
export function sortProjects(projects, sortBy) {
  if (sortBy === 'spots_asc') {
    return projects.sort((a, b) => a.spots_total - b.spots_total);
  }
  return projects;
}
