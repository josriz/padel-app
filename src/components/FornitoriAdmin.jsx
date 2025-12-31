import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function FornitoriAdmin() {
  const [fornitori, setFornitori] = useState([]);
  const [newFornitore, setNewFornitore] = useState({ email: '', password: '', societa: '' });
  const [loading, setLoading] = useState(false);

  const fetchFornitori = async () => {
    const { data } = await supabase.from('fornitori').select(`
      *,
      profiles!user_id (email, role)
    `);
    setFornitori(data || []);
  };

  useEffect(() => { fetchFornitori(); }, []);

  const creaFornitore = async () => {
    setLoading(true);
    
    // 1. Crea utente Supabase
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: newFornitore.email,
      password: newFornitore.password,
      email_confirm: true, // Auto-conferma
      user_metadata: { ruolo: 'fornitore' }
    });

    if (userError) {
      alert('Errore: ' + userError.message);
      setLoading(false);
      return;
    }

    // 2. Crea profilo fornitore
    const { error: fornitoreError } = await supabase
      .from('fornitori')
      .insert({
        user_id: user.user.id,
        nome_societa: newFornitore.societa
      });

    if (fornitoreError) {
      alert('Errore fornitore: ' + fornitoreError.message);
    } else {
      alert('✅ Fornitore creato! Email: ' + newFornitore.email);
      setNewFornitore({ email: '', password: '', societa: '' });
      fetchFornitori();
    }
    
    setLoading(false);
  };

  const eliminaFornitore = async (id) => {
    if (!confirm('ELIMINARE fornitore?')) return;
    
    const fornitore = fornitori.find(f => f.id === id);
    await supabase.auth.admin.deleteUser(fornitore.user_id);
    await supabase.from('fornitori').delete().eq('id', id);
    fetchFornitori();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>👥 Gestione Fornitori</h1>
      
      {/* CREA NUOVO */}
      <div style={styles.card}>
        <h3>🔥 Crea Nuovo Fornitore</h3>
        <div style={styles.formRow}>
          <input 
            placeholder="nome@societa.it" 
            value={newFornitore.email}
            onChange={e => setNewFornitore({...newFornitore, email: e.target.value})}
            style={styles.input}
          />
          <input 
            type="password"
            placeholder="Password (min 6)" 
            value={newFornitore.password}
            onChange={e => setNewFornitore({...newFornitore, password: e.target.value})}
            style={styles.input}
          />
          <input 
            placeholder="Nome Società" 
            value={newFornitore.societa}
            onChange={e => setNewFornitore({...newFornitore, societa: e.target.value})}
            style={styles.input}
          />
          <button onClick={creaFornitore} disabled={loading} style={styles.btnPrimary}>
            {loading ? '⏳' : '➕ CREA'}
          </button>
        </div>
      </div>

      {/* LISTA */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Società</th>
              <th>Email</th>
              <th>Data</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {fornitori.map(f => (
              <tr key={f.id}>
                <td><strong>{f.nome_societa}</strong></td>
                <td>{f.profiles?.email}</td>
                <td>{f.created_at?.split('T')[0]}</td>
                <td>
                  <button onClick={() => eliminaFornitore(f.id)} style={styles.btnDanger}>
                    🗑️ Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  h1: { color: '#1f2937', fontSize: '28px', marginBottom: '24px' },
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '24px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' },
  input: { padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' },
  btnPrimary: { background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  btnDanger: { background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  tableContainer: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '16px', background: '#f8fafc', fontWeight: 600, textAlign: 'left' },
  td: { padding: '16px', borderBottom: '1px solid #f1f5f9' }
};
