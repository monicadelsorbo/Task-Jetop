// =========================================================================
// Export delle candidature in CSV per la segreteria didattica, che apre i
// file con Excel in italiano: separatore `;`, una riga per candidatura.
// Le specifiche sono in `csv.test.js`.
// =========================================================================

const COLUMNS = [
  ['student_name', 'Nome'],
  ['student_role', 'Ruolo'],
  ['motivation', 'Motivazione'],
  ['created_at', 'Data candidatura']
];

export function applicationsToCsv(applications) {
  const header = COLUMNS.map(([, label]) => label).join(',');
  const rows = applications.map((app) => COLUMNS.map(([key]) => app[key] ?? '').join(','));
  return [header, ...rows].join('\n');
}

// Avvia il download del file nel browser
export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
