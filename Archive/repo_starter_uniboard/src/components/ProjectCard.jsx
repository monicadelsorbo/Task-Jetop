import React from 'react';
import { isApplicationOpen } from '../lib/projectUtils';

const DIFF_COLORS = {
  Base: { bg: '#dcfce7', text: '#166534' },
  Intermedio: { bg: '#fef9c3', text: '#854d0e' },
  Avanzato: { bg: '#fee2e2', text: '#991b1b' }
};

export default function ProjectCard({ project, onOpenModal }) {
  if (!project) return null;

  // 🐛 Attenzione: cosa succede se `project.project_applications` è undefined
  // (ad esempio subito dopo aver creato un nuovo progetto in locale)?
  const applicationsCount = project.project_applications.length;
  const spotsRemaining = Math.max(0, project.spots_total - applicationsCount);
  const isFull = spotsRemaining === 0;
  const isOpen = isApplicationOpen(project);

  const diffStyle = DIFF_COLORS[project.difficulty] || DIFF_COLORS.Intermedio;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative'
      }}
    >
      <div>
        {/* Top Badges + Spazio Pulsante Preferiti */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              {project.category}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: diffStyle.bg, color: diffStyle.text }}>
              {project.difficulty}
            </span>
          </div>

          {/* TODO (FEATURE PREFERITI): Sostituire questo placeholder con un vero bottone interattivo ⭐
              che rifletta i preferiti dell'UTENTE CORRENTE (non la colonna globale `is_favorite`). */}
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            {project.is_favorite ? '⭐' : '☆'}
          </span>
        </div>

        {/* Titolo e Descrizione */}
        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px', lineHeight: 1.3 }}>
          {project.title}
        </h3>
        <p style={{ margin: '0 0 14px 0', color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>
          {project.description}
        </p>

        {/* Scadenza Candidature */}
        {project.application_deadline && (
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: isOpen ? '#92400e' : '#991b1b' }}>
            {isOpen
              ? `⏰ Candidature entro il ${project.application_deadline.split('-').reverse().join('/')}`
              : '🔒 Candidature chiuse'}
          </div>
        )}

        {/* Tech Stack Tags */}
        {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {project.tech_stack.map((tech, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer con Posti Occupati e Bottone Dettagli/Candidatura */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
          <span>👤 Lead: <strong>{project.author}</strong></span>
          <span style={{ color: isFull ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
            {isFull ? '⛔ Team Completo' : `🟢 ${spotsRemaining} su ${project.spots_total} posti liberi`}
          </span>
        </div>

        <button
          onClick={onOpenModal}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          📋 Vedi Team ({applicationsCount}) & Candidati
        </button>
      </div>
    </div>
  );
}
