/**
 * Filtra i progetti in base alla stringa di ricerca (searchQuery).
 * Cerca in modo case-insensitive su: titolo, descrizione e stack tecnologico.
 */
export function filterProjects(projects = [], { searchQuery = '' } = {}) {
  if (!searchQuery || !searchQuery.trim()) {
    return projects;
  }

  const query = searchQuery.trim().toLowerCase();

  return projects.filter((project) => {
    // 1. Ricerca nel titolo
    const titleMatch = project.title
      ? project.title.toLowerCase().includes(query)
      : false;

    // 2. Ricerca nella descrizione
    const descMatch = project.description
      ? project.description.toLowerCase().includes(query)
      : false;

    // 3. Ricerca nello stack tecnologico (array di stringhe)
    const techMatch = Array.isArray(project.tech_stack)
      ? project.tech_stack.some((tech) => tech.toLowerCase().includes(query))
      : false;

    return titleMatch || descMatch || techMatch;
  });
}

/**
 * Ordina l'array dei progetti senza mutare l'array originale.
 */
export function sortProjects(projects = [], sortBy = 'newest') {
  if (!Array.isArray(projects)) return [];

  // CREA UNA COPIA SHALLOW ([...projects]) per evitare la mutazione in-place
  const projectsCopy = [...projects];

  return projectsCopy.sort((a, b) => {
    if (sortBy === 'spots_asc') {
      const freeSpotsA = a.spots_total - (a.project_applications?.length || 0);
      const freeSpotsB = b.spots_total - (b.project_applications?.length || 0);
      return freeSpotsA - freeSpotsB; // Ordine crescente (da meno posti a più posti)
    }

    if (sortBy === 'newest') {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Dal più recente al più vecchio
    }

    return 0;
  });
}

/**
 * Verifica se le candidature per un progetto sono ancora aperte.
 */
export function isApplicationOpen(project) {
  if (!project || !project.application_deadline) return true;

  // Imposta la scadenza alla fine del giorno indicato (23:59:59)
  const deadline = new Date(project.application_deadline);
  deadline.setHours(23, 59, 59, 999);

  return new Date() <= deadline;
}

