// utils/admin-api.js
const SUPABASE_URL = 'https://hfegsribygmumfdvujhh.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZWdzcmlieWdtdW1mZHZ1amhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcxNTE3MiwiZXhwIjoyMDgwMjkxMTcyfQ.uvioJND7yulXjoTk9G8rQlQFTgy6sXrYe1VwCAvWjTI'

export async function createFornitore(email, password, nome) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'fornitore', nome }
    })
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Errore creazione fornitore')
  }
  
  return data.user
}
