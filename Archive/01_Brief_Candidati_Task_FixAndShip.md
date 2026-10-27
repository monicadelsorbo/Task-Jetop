# 🚀 Task di Gruppo "Fix & Ship": UniBoard Team Edition v4 (React + Supabase)

Benvenuti! In questa sessione lavorerete insieme in un team di **3-4 persone** su **UniBoard**, una piattaforma web con cui gli studenti universitari propongono progetti, si candidano per entrare nei team e salvano i progetti preferiti.

UniBoard è cresciuta in fretta. Nell'ultimo mese sono state rilasciate **paginazione**, **link condivisibili con i filtri**, **scadenze per le candidature**, **ritiro della candidatura**, **export CSV per la segreteria** e **notifiche**. Il risultato: una lista di segnalazioni da parte di utenti, docenti e segreteria.

Lo stack è **React (Vite)** + **Supabase (PostgreSQL)** con tabelle collegate (`projects`, `project_applications`, `favorites`), **Row Level Security attiva** e un **trigger** che valida le candidature lato server.

**Non avrete il tempo di chiudere tutte le segnalazioni.** È voluto: valutiamo anche come scegliete le priorità.

---

## 🎯 Come lavorare insieme (Cosa osserviamo)

1. **Triage & Divisione del Lavoro**: come leggete il backlog, come stabilite le priorità e come vi dividete le segnalazioni (compilate `TRIAGE.md` nei primi 15 minuti).
2. **Confronto Tecnico ad Alta Voce**: come condividete quello che scoprite (console, tab Network, output dei test) e come prendete decisioni insieme.
3. **Gestione di Git**: branch, commit, Pull Request e merge su `main` senza sovrascrivere il lavoro dei compagni.
4. **Uso dell'AI**: come usate gli assistenti AI per capire, scrivere e **verificare** il codice.

---

## 🤖 Regole sull'uso dell'AI

- Usare assistenti AI (Copilot, ChatGPT, Claude, Gemini, Cursor, ...) è **consentito e incoraggiato**.
- **Siete responsabili di ogni riga che committate**: nel debrief chiederemo a ciascuno di spiegare una parte del codice, anche se l'ha generata un'AI.
- Compilate `AI_LOG.md` con le interazioni più significative (4-6 righe): cosa avete chiesto, cosa avete accettato o scartato e **perché**.
- L'AI non conosce i vincoli qui sotto e non vede il vostro database: se un suggerimento li viola, il suggerimento è sbagliato.

## ⛔ Vincoli di Progetto (non negoziabili)

1. **Non modificate i test esistenti** (`src/lib/*.test.js`): sono la specifica. Potete aggiungerne di nuovi.
2. **Non disabilitate la Row Level Security** e non modificate le policy.
3. **La chiave `service_role` non deve mai finire nel frontend** né nel repository. Usate solo la chiave `anon` fornita.
4. **Non rimuovete le latenze simulate** (`VITE_SIMULATE_SLOW_NETWORK=true` e `pg_sleep` nel trigger): rappresentano le condizioni di produzione.
5. **Il file `.env` non va committato** (è già nel `.gitignore`).
6. **Il database è condiviso dal team**: se un bug cancella dati, avvisate subito il valutatore, che può ripristinarli.

---

## 🛠️ 1. Setup dell'Ambiente

Prerequisiti: **Node.js ≥ 20.6** e Git.

```bash
git clone <URL_DEL_REPOSITORY>
cd uniboard
npm install
```

Create un file `.env` nella root copiando `.env.example` con le chiavi fornite dal valutatore, **poi avviate (o riavviate) il server**: Vite legge il `.env` solo all'avvio.

```env
VITE_SUPABASE_URL=https://vostro-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=la-vostra-anon-key
VITE_SIMULATE_SLOW_NETWORK=true
```

Comandi disponibili:

```bash
npm run dev       # avvia l'app su http://localhost:5173
npm test          # test unitari (Vitest): ricerca, ordinamento, scadenze, CSV
npm run stress    # stress test di concorrenza sulle candidature (progetto 5 di default)
```

- **Correzioni SQL**: scrivetele in `sql_fixes.sql` nella root (così passano dalla code review) e chiedete al valutatore di applicarle, oppure eseguitele voi nell'SQL Editor se vi è stato dato l'accesso.
- **Simulare un altro utente**: aprite l'app con `?user=giulia` (es. `http://localhost:5173/?user=giulia`). L'utente `giulia` ha già due candidature nel database.
- **Limite noto dell'MVP**: ricerca testuale e ordinamento lavorano sui progetti **già caricati** (non su tutto il database).

---

## 📋 2. Backlog delle Segnalazioni

Le segnalazioni descrivono **sintomi**, non cause. Alcune hanno più cause; alcune cause producono più sintomi.

### 🗂️ Bacheca, Filtri e Navigazione

| ID | Segnalato da | Segnalazione |
| --- | --- | --- |
| **UB-01** | Studente | "All'apertura la bacheca è completamente vuota, anche se nel database ci sono 14 progetti." |
| **UB-02** | Studente | "Se cambio categoria o difficoltà la lista non cambia, oppure mostra zero risultati." |
| **UB-03** | Studente | "La ricerca non trova `react` né `python` e ignora la descrizione. *Posti liberi (crescente)* ordina male e, tornando su *Più recenti*, l'ordine non torna quello di prima." (`npm test` è rosso) |
| **UB-04** | Studente in treno | "Con la connessione lenta, se clicco velocemente più categorie, a volte vedo progetti di una categoria diversa da quella selezionata." |
| **UB-05** | Docente referente | "Alcuni progetti compaiono due volte e la console è piena di warning sulle `key`. *Carica altri* ripete un progetto già visto; dopo un cambio di filtro si mescolano card di categorie diverse; a ogni click la griglia sparisce e la pagina torna in cima; dopo l'ultima pagina il bottone resta visibile e non carica nulla." |
| **UB-06** | Rappresentante degli studenti | "Ho condiviso su WhatsApp il link della categoria *AI & Data*: a chi lo apre compare una bacheca vuota. Il tasto *Indietro* del browser cambia l'URL ma non i filtri, e ogni lettera digitata nella ricerca aggiunge una pagina alla cronologia." |
| **UB-07** | Studentessa (`?user=giulia`) | "Ho cambiato filtro, ho premuto F5 e sono diventata un altro utente: le mie candidature non risultano più mie." |

### 🚀 Progetti e Candidature

| ID | Segnalato da | Segnalazione |
| --- | --- | --- |
| **UB-08** | Studente | "Pubblicando un progetto la lista non si aggiorna (a volte la pagina diventa bianca) e il form resta compilato. Se non imposto la scadenza ricevo `invalid input syntax for type date`." |
| **UB-09** | Studente | "Mi candido, ma il mio nome non compare nella modale e posti liberi e statistiche non si aggiornano finché non faccio F5." |
| **UB-10** | Docente referente | "Il progetto *Infrastruttura Cloud Kubernetes* è pieno (2/2) ma accetta altre candidature. Abbiamo anche lanciato `npm run stress`: finisce con `❌ OVERBOOKING`." |
| **UB-11** | Docente referente | "Il mio progetto *Forum Esami con Peer-Review* scade **oggi**, ma risulta già *Candidature chiuse* e nessuno riesce a candidarsi." |
| **UB-12** | Studentessa (`?user=giulia`) | "Ho ritirato la mia candidatura da *GitOps Lab con ArgoCD*: nella modale risulto ancora iscritta e, dopo F5, è **sparito tutto il team**!" |
| **UB-13** | Studente | "I messaggi d'errore sono incomprensibili (codici tecnici). Quando compaiono due notifiche di fila la prima sparisce, e a volte una notifica appena comparsa sparisce subito." |
| **UB-14** | Segreteria didattica | "Il CSV dei candidati di *CTF Training Platform*, aperto in Excel, ha le colonne sfasate, le lettere accentate illeggibili e una motivazione che si è trasformata in un link cliccabile che nessuno ha inserito." |

---

## ✨ 3. Feature da Sviluppare: Preferiti per Utente

File coinvolti: `ProjectCard.jsx`, `FilterBar.jsx`, `StatsBanner.jsx`, `App.jsx`, Supabase.

1. **Bottone ⭐ sulla Card** che aggiunge/rimuove il progetto dai preferiti.
2. **Preferiti per utente**: con `?user=giulia` si vedono preferiti diversi da quelli del vostro utente.
3. **Persistenza**: dopo un F5 i preferiti sono ancora lì. Valutate in team quale struttura dati usare tra quelle presenti nello schema.
4. **UI ottimistica**: la stellina cambia **subito** al click; se il salvataggio fallisce torna allo stato precedente e l'utente viene avvisato con una notifica.
5. **Filtro "⭐ Solo Preferiti"** in `FilterBar.jsx`, combinabile con gli altri filtri.
6. **KPI**: *"SALVATI NEI PREFERITI ⭐"* conta i preferiti dell'utente corrente e si aggiorna senza ricaricare la pagina.

### 🏆 Bonus (solo se avete chiuso le segnalazioni prioritarie)

**Candidature in tempo reale**: con due schede aperte, quando qualcuno si candida o ritira la candidatura in una, l'altra si aggiorna senza F5 (Supabase Realtime, `postgres_changes` su `project_applications`). Attenzione a non mostrare due volte la candidatura appena inviata da voi.

---

## ✅ 4. Definition of Done

Per ogni segnalazione che dichiarate chiusa:

- il sintomo non si riproduce più, **con la rete lenta attiva**;
- `npm test` e `npm run build` restano verdi (se il repo è su GitHub, la CI della Pull Request deve essere verde);
- per UB-10: `npm run stress` termina con `✅ Capienza rispettata`.

A fine sessione: demo dal branch `main`, `TRIAGE.md` e `AI_LOG.md` compilati.

## 🌿 5. Consegna e Regole Git

- Avete **120 minuti**, seguiti da circa **15 minuti di demo e discussione**.
- Lavorate su branch separati (`fix/UB-xx-...`, `feat/...`) e integrate su `main` tramite Pull Request (o merge concordati a voce). `App.jsx` e `ProjectModal.jsx` sono toccati da molte segnalazioni: coordinatevi!
- Nel messaggio di commit o nella PR citate l'ID della segnalazione (es. `fix(UB-12): ritira solo la propria candidatura`).
