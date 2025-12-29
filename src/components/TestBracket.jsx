import { useState } from 'react'
import { supabase } from './supabaseClient' // adatta il percorso

export default function TestSalvataggio() {
  const [loading, setLoading] = useState(false)
  
  const testaSalvataggio = async () => {
    setLoading(true)
    console.clear() // pulisce console
    
    console.log('👤 Utente:', supabase.auth.getUser())
    
    const { data, error } = await supabase
      .from('padel_brackets')
      .insert({ 
        test_field: 'PROVA-' + Date.now(),
        user_id: supabase.auth.currentUser?.id || 'anon'
      })
      .select()

    console.log('📊 DATA:', data)
    console.log('🚨 ERROR:', error)
    
    setLoading(false)
    alert(error ? '❌ ' + error.message : '✅ SALVATO! ID: ' + data[0].id)
  }

  return (
    <div style={{padding: '20px', background: 'yellow'}}>
      <button 
        onClick={testaSalvataggio} 
        disabled={loading}
        style={{padding: '10px 20px', fontSize: '16px'}}
      >
        {loading ? 'TEST...' : '🔥 TEST SALVA BRACKET'}
      </button>
    </div>
  )
}
