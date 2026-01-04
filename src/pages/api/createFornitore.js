// createFornitore.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hfegsribygmumfdvujhh.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZWdzcmlieWdtdW1mZHZ1amhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcxNTE3MiwiZXhwIjoyMDgwMjkxMTcyfQ.uvioJND7yulXjoTk9G8rQlQFTgy6sXrYe1VwCAvWjTI'; // metti qui la tua service role key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });

  try {
    const { email, nome } = req.body;
    if (!email || !nome) return res.status(400).json({ error: 'Email e nome obbligatori' });

    // Crea utente su Supabase Auth
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-10) + 'A1!',
      email_confirm: true,
      user_metadata: { role: 'fornitore', nome }
    });

    if (createError) return res.status(500).json({ error: createError.message });

    // Invia email reset password
    const { error: mailError } = await supabase.auth.admin.resetUserPasswordForEmail(email);
    if (mailError) return res.status(500).json({ error: mailError.message });

    return res.status(200).json({ message: `Utente creato e email inviata a ${email}` });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Errore generico' });
  }
}
