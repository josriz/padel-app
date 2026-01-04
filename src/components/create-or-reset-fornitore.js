import { createClient } from '@supabase/supabase-js';

// ⚡ Backend Node.js → SERVICE_ROLE_KEY
const SUPABASE_URL = 'https://hfegsribygmumfdvujhh.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZWdzcmlieWdtdvujhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcxNTE3MiwiZXhwIjoyMDgwMjkxMTcyfQ.uvioJND7yulXjoTk9G8rQlQFTgy6sXrYe1VwCAvWjTI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function resetFornitore() {
  const email = 'test@padel.it';
  const password = 'temporaryPassword123!';
  const nomeSocieta = 'Societa Test';

  // 1️⃣ Trova l'utente esistente
  const { data: users, error: listError } = await supabase.auth.admin.listUsers({
    filter: `email=eq.${email}`
  });

  if (listError) {
    console.error('Errore controllando utenti:', listError);
    return;
  }

  if (users.length === 0) {
    console.error('Utente non trovato in Auth. Devi crearlo manualmente prima.');
    return;
  }

  const userId = users[0].id;

  // 2️⃣ Aggiorna password e conferma email
  const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true
  });

  if (updateError) {
    console.error('Errore aggiornando password:', updateError);
    return;
  }

  console.log('Password aggiornata con successo:', updateData);

  // 3️⃣ Inserisci il record nella tabella fornitori (se non esiste)
  const { data: fornitoriData, error: fornitoriError } = await supabase
    .from('fornitori')
    .upsert([{ nome_societa: nomeSocieta, fornitore_id: userId }], { onConflict: 'fornitore_id' });

  if (fornitoriError) {
    console.error('Errore inserendo/aggiornando fornitore:', fornitoriError);
    return;
  }

  console.log('Fornitore inserito/aggiornato con successo:', fornitoriData);
}

resetFornitore();
