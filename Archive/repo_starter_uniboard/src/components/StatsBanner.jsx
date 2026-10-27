import React from 'react';

export default function StatsBanner({ projects = [] }) {
  const totalProjects = projects.length;

  // Calcola il totale delle candidature ricevute su tutti i progetti visibili
  const totalApplications = projects.reduce((acc, proj) => {
    const apps = proj.project_applications || [];
    return acc + apps.length;
  }, 0);

  // Calcola quanti progetti hanno ancora almeno 1 posto libero
  const openProjectsCount = projects.filter((proj) => {
    const taken = (proj.project_applications || []).length;
    return proj.spots_total - taken > 0;
  }).length;

  // Contatore Preferiti
  // TODO (FEATURE PREFERITI): `is_favorite` è una colonna GLOBALE della tabella `projects`,
  // non i preferiti dell'utente corrente. Il KPI deve contare i preferiti di chi sta usando l'app.
  const favoritesCount = projects.filter((proj) => proj.is_favorite).length;

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '16px 20px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>PROGETTI IN BACHECA</div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{totalProjects}</div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>TEAM CON POSTI APERTI</div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{openProjectsCount}</div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>CANDIDATURE INVIATE</div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{totalApplications}</div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>SALVATI NEI PREFERITI ⭐</div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{favoritesCount}</div>
      </div>
    </div>
  );
}
