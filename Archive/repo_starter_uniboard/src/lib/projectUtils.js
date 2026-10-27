// =========================================================================
// Funzioni pure per derivare dati dai progetti (usate da App e dai componenti).
// =========================================================================

export function getSpotsLeft(project) {
  const taken = (project.project_applications || []).length;
  return Math.max(0, project.spots_total - taken);
}

// Lasciata intatta come nell'originale (senza toccare la task 11)
export function isApplicationOpen(project, now = new Date()) {
  if (!project.application_deadline) return true;
  return new Date(project.application_deadline) >= now;
}

// 🐛 UB-03 (Ricerca testuale su titolo, descrizione e tag)
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

// 🐛 UB-03 (Ordinamento)
export function sortProjects(projects, sortBy) {
  const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at);
  const copy = [...projects];

  if (sortBy === 'spots_asc') {
    return copy.sort((a, b) => getSpotsLeft(a) - getSpotsLeft(b) || byNewest(a, b));
  }
  return copy.sort(byNewest);
}