// src/lib/adminClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://hfegsribygmumfdvujhh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZWdzcmlieWdtdW1mZHZ1amhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcxNTE3MiwiZXhwIjoyMDgwMjkxMTcyfQ.uvioJND7yulXjoTk9G8rQlQFTgy6sXrYe1VwCAvWjTI'
)

export async function createFornitore(email, password, nome) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { 
      role: 'fornitore', 
      nome: nome || 'Fornitore',
      full_name: nome || 'Fornitore'
    }
  })
  
  if (error) throw new Error(error.message)
  return data.user
}
