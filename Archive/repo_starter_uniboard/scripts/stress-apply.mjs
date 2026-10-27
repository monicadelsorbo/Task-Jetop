// =========================================================================
// Stress test di concorrenza sulle candidature.
// Invia in PARALLELO più candidature di quanti posti restano nel progetto e
// verifica che il database non accetti mai più di `spots_total` candidature.
//
// Uso:  npm run stress            (progetto 5 di default)
//       npm run stress -- 6       (progetto con id 6)
// =========================================================================
import { createClient } from '@supabase/supabase-js';

const projectId = Number(process.argv[2] || 5);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function loadProject() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, spots_total, project_applications(id)')
    .eq('id', projectId)
    .single();
  if (error) {
    console.error('Impossibile leggere il progetto:', error.message);
    process.exit(1);
  }
  return data;
}

const project = await loadProject();
const spotsLeft = Math.max(0, project.spots_total - project.project_applications.length);
const attempts = spotsLeft + 2;
const runId = Date.now().toString(36);

console.log(`Progetto #${project.id} "${project.title}"`);
console.log(`Posti: ${project.spots_total} totali, ${spotsLeft} liberi -> invio ${attempts} candidature in parallelo...\n`);

const results = await Promise.all(
  Array.from({ length: attempts }, (_, i) =>
    supabase.from('project_applications').insert([
      {
        project_id: project.id,
        student_name: `Stress ${runId}-${i + 1}`,
        student_role: 'Backend Dev',
        motivation: 'Stress test di concorrenza'
      }
    ])
  )
);

results.forEach((r, i) => {
  console.log(`  #${i + 1}: ${r.error ? `rifiutata (${r.error.code}) ${r.error.message}` : 'accettata'}`);
});

const after = await loadProject();
const taken = after.project_applications.length;
console.log(`\nCandidature finali: ${taken}/${after.spots_total}`);

if (taken > after.spots_total) {
  console.log('❌ OVERBOOKING: il database ha accettato più candidature dei posti disponibili.');
  process.exit(1);
}
console.log('✅ Capienza rispettata.');
