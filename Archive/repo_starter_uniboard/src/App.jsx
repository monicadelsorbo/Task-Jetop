import React, { useState } from 'react';
import StatsBanner from './components/StatsBanner';
import FilterBar from './components/FilterBar';
import ProjectCard from './components/ProjectCard';
import NewProjectForm from './components/NewProjectForm';
import ProjectModal from './components/ProjectModal';
import { filterProjects, sortProjects } from './lib/projectUtils';
import { getCurrentUserId } from './lib/currentUser';
import { useProjects } from './hooks/useProjects';
import { useUrlFilters } from './hooks/useUrlFilters';

export const CATEGORIES = ['Tutte', 'Web Dev', 'AI & Data', 'Cloud & DevOps', 'Mobile', 'Cybersecurity'];
export const DIFFICULTIES = ['Tutte', 'Base', 'Intermedio', 'Avanzato'];

export default function App() {
  const [currentUserId] = useState(getCurrentUserId);

  // Filtri sincronizzati con l'URL (link condivisibili)
  const [filters, updateFilters] = useUrlFilters();
  const { category: selectedCategory, difficulty: selectedDifficulty, q: searchQuery, sort: sortBy } = filters;
  // TODO (FEATURE PREFERITI): Aggiungere lo stato dei preferiti dell'utente corrente
  // (caricati dalla tabella `favorites`) e lo stato `onlyFavorites` per il filtro.

  // Progetti caricati da Supabase, a pagine (vedi hooks/useProjects.js)
  const { projects, setProjects, loading, errorMsg, hasMore, loadMore } = useProjects({
    category: selectedCategory,
    difficulty: selectedDifficulty
  });

  // Stato per la Modale Dettaglio & Candidature
  const [activeProject, setActiveProject] = useState(null);

  // =========================================================================
  // 🐛 UB-08 / UB-09 (Stato React Immutabile, Sincronizzazione Modale & Candidature):
  // Quando si pubblica un nuovo progetto o si invia una candidatura dalla
  // modale, l'interfaccia principale e i contatori non si aggiornano come
  // dovrebbero o generano errori su `.project_applications.length`.
  // =========================================================================
  const handleProjectCreated = (newProject) => {
    projects.push(newProject);
    setProjects(projects);
  };

  const handleApplicationSubmitted = (projectId, newApplication) => {
    // Aggiorna la lista delle candidature del progetto appena modificato
    const target = projects.find((p) => p.id === projectId);
    if (target) {
      target.project_applications.push(newApplication);
      setProjects(projects);
    }
  };

  const handleApplicationWithdrawn = (projectId, applicationId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, project_applications: p.project_applications.filter((a) => a.id !== applicationId) }
          : p
      )
    );
  };

  // TODO (FEATURE PREFERITI):
  // Implementare la funzione `handleToggleFavorite(projectId)` che:
  // 1. Aggiorna SUBITO la UI (aggiornamento ottimistico), senza attendere Supabase.
  // 2. Persiste la scelta su Supabase per l'utente `currentUserId`.
  // 3. Se la chiamata fallisce, ripristina lo stato precedente e avvisa l'utente.
  // Verificate che dopo un F5 i preferiti siano ancora lì!

  // Lista effettivamente mostrata: ricerca e ordinamento sono calcolati lato client
  // sui progetti già caricati (limite noto dell'MVP con la paginazione).
  const visibleProjects = sortProjects(filterProjects(projects, { searchQuery }), sortBy);

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header Applicazione */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '28px' }}>
            🎓 UniBoard <span style={{ fontSize: '14px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: '999px', verticalAlign: 'middle' }}>Team Edition</span>
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>
            Esplora i progetti universitari, proponi la tua idea o candidati per entrare in un team.
          </p>
        </div>
        <span style={{ fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '999px' }}>
          👤 Sei: <strong>{currentUserId}</strong>
        </span>
      </header>

      {/* Dashboard Statistiche (KPI) */}
      <StatsBanner projects={projects} />

      {/* Form Creazione Nuovo Progetto */}
      <NewProjectForm
        categories={CATEGORIES.slice(1)}
        difficulties={DIFFICULTIES.slice(1)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Barra Filtri Avanzata */}
      <FilterBar
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={(category) => updateFilters({ category })}
        difficulties={DIFFICULTIES}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={(difficulty) => updateFilters({ difficulty })}
        searchQuery={searchQuery}
        onSearchChange={(q) => updateFilters({ q })}
        sortBy={sortBy}
        onSortChange={(sort) => updateFilters({ sort })}
      />

      {/* Messaggi di Errore */}
      {errorMsg && (
        <div style={{ padding: '14px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecaca' }}>
          ⚠️ <strong>Errore:</strong> {errorMsg}
        </div>
      )}

      {/* Griglia Progetti */}
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
          Caricamento bacheca progetti da Supabase...
        </div>
      ) : visibleProjects.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#334155' }}>Nessun progetto trovato</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Prova a modificare i filtri di ricerca o verifica la query verso il database.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
          {visibleProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onOpenModal={() => setActiveProject(proj)}
            />
          ))}
        </div>
      )}

      {/* Paginazione */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={loadMore}
            style={{ padding: '10px 22px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}
          >
            ⬇️ Carica altri progetti
          </button>
        </div>
      )}

      {/* Modale Dettaglio Progetto & Invio Candidatura */}
      {activeProject && (
        <ProjectModal
          project={activeProject}
          currentUserId={currentUserId}
          onClose={() => setActiveProject(null)}
          onApplicationSubmitted={handleApplicationSubmitted}
          onApplicationWithdrawn={handleApplicationWithdrawn}
        />
      )}
    </div>
  );
}
