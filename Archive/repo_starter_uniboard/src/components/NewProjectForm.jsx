import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastProvider';

export default function NewProjectForm({ categories, difficulties, onProjectCreated }) {
  const showToast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Web Dev');
  const [difficulty, setDifficulty] = useState(difficulties[1] || 'Intermedio');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState(''); // es. "React, Node, Docker"
  const [author, setAuthor] = useState('');
  const [spotsTotal, setSpotsTotal] = useState(3);
  const [deadline, setDeadline] = useState(''); // 'YYYY-MM-DD', opzionale
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !author.trim()) return;

    setSubmitting(true);

    const techArray = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      category,
      difficulty,
      description: description.trim(),
      tech_stack: techArray,
      author: author.trim(),
      spots_total: Number(spotsTotal),
      application_deadline: deadline
    };

    // 🐛 UB-08:
    // 1. Cosa restituisce `data` in Supabase v2 se non si chiama `.select()` dopo `.insert()`?
    // 2. Quando passiamo il nuovo progetto a `onProjectCreated`, avrà la proprietà `project_applications: []`
    //    che `ProjectCard.jsx` si aspetta di leggere?
    const { data, error } = await supabase.from('projects').insert([payload]);

    setSubmitting(false);

    if (error) {
      showToast('Errore durante la creazione del progetto: ' + error.message, 'error');
      return;
    }

    showToast('Progetto pubblicato!', 'success');

    onProjectCreated(data ? data[0] : null);
  };

  if (!isOpen) {
    return (
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '10px 18px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ➕ Proponi un Nuovo Progetto Universitario
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>➕ Pubblica Nuovo Progetto</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
        >
          ✕ Chiudi
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Titolo del progetto..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>Difficoltà: {d}</option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Descrivi gli obiettivi del progetto e quali figure stai cercando..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={2}
        style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Stack Tecnologico separato da virgola (es. React, Python, Docker)"
          value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
          style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <input
          type="text"
          placeholder="Tuo Nome (es. Marco R.)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <label style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Posti Max:
          <input
            type="number"
            min={1}
            max={10}
            value={spotsTotal}
            onChange={(e) => setSpotsTotal(e.target.value)}
            style={{ width: '55px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Scadenza:
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 20px',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {submitting ? 'Salvataggio...' : 'Pubblica'}
        </button>
      </div>
    </form>
  );
}
