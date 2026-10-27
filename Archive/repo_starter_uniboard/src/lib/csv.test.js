// =========================================================================
// SPECIFICHE di csv.js — questi test sono il contratto: NON modificateli
// per farli passare. Potete aggiungerne di nuovi.
// =========================================================================
import { describe, it, expect } from 'vitest';
import { applicationsToCsv } from './csv';

const app = (overrides = {}) => ({
  student_name: 'Anna B.',
  student_role: 'Frontend Dev',
  motivation: 'Mi piace React',
  created_at: '2026-10-01T10:00:00Z',
  ...overrides
});

const lines = (csv) => csv.split('\r\n');

describe('applicationsToCsv', () => {
  it("usa il punto e virgola come separatore e l'intestazione in italiano", () => {
    expect(lines(applicationsToCsv([]))[0]).toBe('Nome;Ruolo;Motivazione;Data candidatura');
  });

  it('scrive una riga per candidatura, con i fine riga CRLF', () => {
    const csv = applicationsToCsv([app(), app({ student_name: 'Luca G.' })]);
    expect(lines(csv)).toEqual([
      'Nome;Ruolo;Motivazione;Data candidatura',
      'Anna B.;Frontend Dev;Mi piace React;2026-10-01T10:00:00Z',
      'Luca G.;Frontend Dev;Mi piace React;2026-10-01T10:00:00Z'
    ]);
  });

  it('lascia vuoti i campi null', () => {
    expect(lines(applicationsToCsv([app({ motivation: null })]))[1]).toBe('Anna B.;Frontend Dev;;2026-10-01T10:00:00Z');
  });

  it('racchiude tra virgolette i campi che contengono il separatore', () => {
    const row = lines(applicationsToCsv([app({ motivation: 'CI/CD; 5 ore a settimana' })]))[1];
    expect(row).toBe('Anna B.;Frontend Dev;"CI/CD; 5 ore a settimana";2026-10-01T10:00:00Z');
  });

  it('raddoppia le virgolette interne', () => {
    const row = lines(applicationsToCsv([app({ motivation: 'Conosco il pattern "app of apps"' })]))[1];
    expect(row).toBe('Anna B.;Frontend Dev;"Conosco il pattern ""app of apps""";2026-10-01T10:00:00Z');
  });

  it('mantiene gli a capo dentro un campo racchiudendolo tra virgolette', () => {
    const csv = applicationsToCsv([app({ motivation: 'Riga uno\nRiga due' })]);
    expect(csv).toContain('"Riga uno\nRiga due"');
    expect(lines(csv)).toHaveLength(2);
  });

  it('neutralizza le formule (CSV injection) anteponendo un apice', () => {
    const csv = applicationsToCsv([
      app({ motivation: '=HYPERLINK("https://example.com/cv";"Il mio CV")' }),
      app({ student_name: '@SOMMA(A1)' }),
      app({ student_role: '+39 333' }),
      app({ motivation: '-1+1' })
    ]);
    const [, r1, r2, r3, r4] = lines(csv);
    expect(r1).toBe('Anna B.;Frontend Dev;"\'=HYPERLINK(""https://example.com/cv"";""Il mio CV"")";2026-10-01T10:00:00Z');
    expect(r2.startsWith("'@SOMMA(A1);")).toBe(true);
    expect(r3).toContain(";'+39 333;");
    expect(r4).toContain(";'-1+1;");
  });
});
