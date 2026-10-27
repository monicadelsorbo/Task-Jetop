import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastProvider';
import { isApplicationOpen } from '../lib/projectUtils';
import { applicationsToCsv, downloadCsv } from '../lib/csv';

export default function ProjectModal({ project, currentUserId, onClose, onApplicationSubmitted, onApplicationWithdrawn }) {
  const showToast = useToast();
  const [studentName, setStudentName] = useState('');
  const [studentRole, setStudentRole] = useState('Frontend Dev');
  const [motivation, setMotivation] = useState('');
  const [sending, setSending] = useState(false);

  const applications = project.project_applications || [];
  const spotsLeft = Math.max(0, project.spots_total - applications.length);
  const isOpen = isApplicationOpen(project);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    // 🐛 UB-09 / UB-10 / UB-13 (Validazione Logica & Inserimento Relazionale):
    // 1. Cosa succede se un utente invia il form quando `spotsLeft === 0`?
    // 2. Anche qui `.insert()` su `project_applications` non ha `.select().single()`,
    //    quindi `data` sarà null e la lista nella modale non mostrerà il nome appena inserito!
    // 3. Il controllo lato client non basta: due studenti possono candidarsi nello stesso
    //    istante da due browser diversi (provate `npm run stress`). Il database ha un trigger
    //    `enforce_project_capacity` che dovrebbe impedire l'overbooking: funziona davvero?
    // 4. Quando il DB rifiuta la candidatura (team pieno o candidatura duplicata),
    //    l'utente deve vedere un messaggio comprensibile, non un alert con l'errore grezzo.
    setSending(true);
    const newApp = {
      project_id: project.id,
      student_name: studentName.trim(),
      student_role: studentRole,
      motivation: motivation.trim(),
      user_identifier: currentUserId
    };

    const { data, error } = await supabase
      .from('project_applications')
      .insert([newApp]);

    setSending(false);

    if (error) {
      showToast('Errore invio candidatura: ' + error.message, 'error');
      return;
    }

    showToast('Candidatura inviata!', 'success');
    onApplicationSubmitted(project.id, data ? data[0] : null);
    setStudentName('');
    setMotivation('');
  };

  // Ritiro della propria candidatura
  const handleWithdraw = async (application) => {
    if (!window.confirm('Vuoi davvero ritirare la tua candidatura?')) return;
// ub 12 
    const { error } = await supabase
  .from('project_applications')
  .delete()
  .eq('id', application.id);

    if (error) {
      showToast('Errore durante il ritiro: ' + error.message, 'error');
      return;
    }

    showToast('Candidatura ritirata.', 'success');
    onApplicationWithdrawn(application.project_id, application.id);
  };

  // Export delle candidature per la segreteria didattica
  const handleExport = () => {
    downloadCsv(`candidature-progetto-${project.id}.csv`, applicationsToCsv(applications));
    showToast('File CSV scaricato.', 'success');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          maxWidth: '620px',
          width: '100%',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '999px' }}>
              {project.category} • {project.difficulty}
            </span>
            <h2 style={{ margin: '8px 0 4px 0', color: '#0f172a' }}>{project.title}</h2>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Proposto da <strong>{project.author}</strong> • Posti rimasti: <strong>{spotsLeft} su {project.spots_total}</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: '#334155', fontSize: '14px', lineHeight: 1.6, backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
          {project.description}
        </p>

        {/* Lista Membri / Candidature Attuali */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
          <h4 style={{ margin: 0, color: '#0f172a' }}>
            👥 Studenti già candidati ({applications.length}/{project.spots_total})
          </h4>
          {applications.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              📥 Esporta CSV
            </button>
          )}
        </div>
        {applications.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
            Nessuna candidatura ancora inviata. Sii il primo!
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {applications.map((app, i) => (
              <li
                key={app?.id || i}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{app?.student_name || 'Studente'}</strong>{' '}
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>({app?.student_role})</span>
                  {app?.motivation && <div style={{ color: '#64748b', marginTop: '2px' }}>"{app.motivation}"</div>}
                </div>
                {app?.user_identifier === currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleWithdraw(app)}
                    style={{ background: 'none', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    Ritira
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Form per Candidarsi al Progetto */}
        {!isOpen ? (
          <p style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', color: '#991b1b', fontSize: '14px', fontWeight: 600 }}>
            🔒 Le candidature per questo progetto sono chiuse.
          </p>
        ) : (
          <form onSubmit={handleApply} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>🚀 Unisciti a questo Team</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Il tuo Nome e Cognome..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <select
                value={studentRole}
                onChange={(e) => setStudentRole(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="Frontend Dev">Frontend Dev</option>
                <option value="Backend Dev">Backend Dev</option>
                <option value="Full-Stack">Full-Stack</option>
                <option value="AI & Data">AI & Data</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Breve messaggio (es. 'Conosco bene React e vorrei aiutare sulla UI')..."
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              disabled={sending}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {sending ? 'Invio in corso...' : 'Invia Candidatura'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
