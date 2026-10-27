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
  const [year, month, day] = project.application_deadline.split('-').map(Number);
  const startOfNextDay = new Date(year, month - 1, day + 1); // mezzanotte LOCALE del giorno dopo
  return now < startOfNextDay;
}

// Ricerca su titolo, descrizione e tag tecnologici (parziale, senza distinzione di maiuscole).
export function filterProjects(projects, { searchQuery = '' } = {}) {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return projects;

  return projects.filter(
    (p) =>
      (p.title ?? '').toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      (p.tech_stack ?? []).some((tag) => tag.toLowerCase().includes(q))
  );
}

// Ordinamento:
// 'newest'    -> created_at decrescente
// 'spots_asc' -> posti LIBERI crescenti (a parità, il più recente prima)
export function sortProjects(projects, sortBy) {
  const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at);
  const copy = [...projects];

  if (sortBy === 'spots_asc') {
    return copy.sort((a, b) => getSpotsLeft(a) - getSpotsLeft(b) || byNewest(a, b));
  }
  return copy.sort(byNewest);
}