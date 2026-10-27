// =========================================================================
// SPECIFICHE di projectUtils.js — questi test sono il contratto: NON modificateli
// per farli passare. Potete aggiungerne di nuovi (es. per i Preferiti).
// =========================================================================
import { describe, it, expect } from 'vitest';
import { getSpotsLeft, filterProjects, sortProjects, isApplicationOpen } from './projectUtils';

const makeProject = (id, overrides = {}) => ({
  id,
  title: `Progetto ${id}`,
  description: '',
  tech_stack: [],
  spots_total: 3,
  project_applications: [],
  created_at: `2026-01-0${id}T10:00:00Z`,
  ...overrides
});

const apps = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));

describe('getSpotsLeft', () => {
  it('calcola i posti ancora liberi', () => {
    expect(getSpotsLeft(makeProject(1, { spots_total: 4, project_applications: apps(1) }))).toBe(3);
  });

  it('gestisce un progetto appena creato senza project_applications', () => {
    const { project_applications, ...fresh } = makeProject(1);
    expect(getSpotsLeft(fresh)).toBe(3);
  });

  it('non restituisce mai un valore negativo', () => {
    expect(getSpotsLeft(makeProject(1, { spots_total: 2, project_applications: apps(3) }))).toBe(0);
  });
});

describe('filterProjects', () => {
  const projects = [
    makeProject(1, { title: 'Smart Campus Map', tech_stack: ['React Native', 'TypeScript'] }),
    makeProject(2, { title: 'Assistente RAG', description: 'Interroga dispense PDF con un LLM', tech_stack: ['Python', 'LangChain'] }),
    makeProject(3, { title: 'BookSwap', tech_stack: ['React', 'Supabase'] })
  ];
  const ids = (list) => list.map((p) => p.id);

  it('senza query restituisce tutti i progetti', () => {
    expect(ids(filterProjects(projects, { searchQuery: '' }))).toEqual([1, 2, 3]);
  });

  it('cerca nel titolo ignorando maiuscole/minuscole e spazi esterni', () => {
    expect(ids(filterProjects(projects, { searchQuery: '  bookswap ' }))).toEqual([3]);
  });

  it('cerca anche nella descrizione', () => {
    expect(ids(filterProjects(projects, { searchQuery: 'dispense' }))).toEqual([2]);
  });

  it('cerca nei tag tecnologici ignorando maiuscole/minuscole', () => {
    expect(ids(filterProjects(projects, { searchQuery: 'python' }))).toEqual([2]);
  });

  it('trova corrispondenze parziali nei tag ("react" trova sia "React" sia "React Native")', () => {
    expect(ids(filterProjects(projects, { searchQuery: 'react' }))).toEqual([1, 3]);
  });

  it('non va in crash se tech_stack è null', () => {
    const withNull = [...projects, makeProject(4, { title: 'Progetto senza stack', tech_stack: null })];
    expect(ids(filterProjects(withNull, { searchQuery: 'senza stack' }))).toEqual([4]);
    expect(() => filterProjects(withNull, { searchQuery: 'docker' })).not.toThrow();
  });
});

describe('sortProjects', () => {
  // Ordine volutamente "mescolato" rispetto a created_at
  const input = [
    makeProject(2, { spots_total: 3, project_applications: apps(0) }), // 3 liberi
    makeProject(5, { spots_total: 4, project_applications: apps(3) }), // 1 libero
    makeProject(1, { spots_total: 2, project_applications: apps(1) }), // 1 libero
    makeProject(4, { spots_total: 2, project_applications: apps(0) })  // 2 liberi
  ];
  const ids = (list) => list.map((p) => p.id);

  it("'newest' ordina per created_at decrescente", () => {
    expect(ids(sortProjects(input, 'newest'))).toEqual([5, 4, 2, 1]);
  });

  it("'spots_asc' ordina per posti LIBERI crescenti, a parità il più recente prima", () => {
    expect(ids(sortProjects(input, 'spots_asc'))).toEqual([5, 1, 4, 2]);
  });

  it("non modifica l'array ricevuto (lo stato React è immutabile)", () => {
    const copy = [...input];
    const resultSpots = sortProjects(input, 'spots_asc');
    const resultNewest = sortProjects(input, 'newest');
    expect(input).toEqual(copy);
    expect(resultSpots).not.toBe(input);
    expect(resultNewest).not.toBe(input);
  });
});

describe('isApplicationOpen', () => {
  // `now` è un orario LOCALE: il test deve passare in qualunque fuso orario
  const at = (hours, minutes = 0) => new Date(2026, 2, 10, hours, minutes); // 10 marzo 2026

  it('senza scadenza le candidature sono sempre aperte', () => {
    expect(isApplicationOpen(makeProject(1, { application_deadline: null }), at(12))).toBe(true);
  });

  it('sono aperte prima del giorno di scadenza', () => {
    expect(isApplicationOpen(makeProject(1, { application_deadline: '2026-03-11' }), at(12))).toBe(true);
  });

  it('sono aperte per tutto il giorno di scadenza, fino a mezzanotte', () => {
    const project = makeProject(1, { application_deadline: '2026-03-10' });
    expect(isApplicationOpen(project, at(0, 30))).toBe(true);
    expect(isApplicationOpen(project, at(12))).toBe(true);
    expect(isApplicationOpen(project, at(23, 59))).toBe(true);
  });

  it('sono chiuse dal giorno successivo alla scadenza', () => {
    expect(isApplicationOpen(makeProject(1, { application_deadline: '2026-03-09' }), at(0, 1))).toBe(false);
  });
});
