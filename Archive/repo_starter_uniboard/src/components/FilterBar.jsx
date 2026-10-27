import React from 'react';

export default function FilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  difficulties,
  selectedDifficulty,
  onSelectDifficulty,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange
  // TODO (FEATURE): Ricevere le props per attivare/disattivare il filtro "Solo Preferiti"
}) {
  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
    >
      {/* Riga 1: Bottoni Categoria + Toggle Preferiti */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: selectedCategory === cat ? '#1e293b' : '#f8fafc',
                color: selectedCategory === cat ? '#ffffff' : '#334155',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TODO (FEATURE PREFERITI): Aggiungere qui il pulsante toggle "⭐ Solo Preferiti" */}
      </div>

      {/* Riga 2: Ricerca testuale, Filtro Difficoltà e Ordinamento */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
        <input
          type="text"
          placeholder="🔍 Cerca per titolo, descrizione o tecnologia (es. React, Python)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: '1 1 280px',
            padding: '9px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '14px'
          }}
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
            Difficoltà:{' '}
            <select
              value={selectedDifficulty}
              onChange={(e) => onSelectDifficulty(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginLeft: '4px' }}
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </label>

          <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
            Ordina per:{' '}
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginLeft: '4px' }}
            >
              <option value="newest">Più recenti</option>
              <option value="spots_asc">Posti liberi (crescente)</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
