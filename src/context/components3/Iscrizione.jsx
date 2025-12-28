// Contenuto aggiornato per Iscrizione.js (per coerenza)
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Iscrizione() {
  const [form, setForm] = useState({ name: '', surname: '', email: '', phone: '' });
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    // 1. Controllo email duplicata
    const { data: existing, error: err1 } = await supabase
      .from('tournament_players')
      .select('email')
      .eq('email', form.email);

    if (err1) {
      setMessage('❌ Errore controllo email: ' + err1.message);
      return;
    }

    if (existing.length > 0) {
      setMessage('⚠️ Email già iscritta.');
      return;
    }

    // 2. Inserisci giocatore (user_id sarà NULL)
    const { error } = await supabase.from('tournament_players').insert([form]);

    if (error) {
      setMessage('❌ Errore iscrizione: ' + error.message);
    } else {
      setMessage('✅ Iscrizione effettuata con successo!');
      setForm({ name: '', surname: '', email: '', phone: '' });
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Iscrizione Giocatore</h3>
      <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required className="block w-full p-2 mb-2 border rounded" />
      <input name="surname" placeholder="Cognome" value={form.surname} onChange={handleChange} required className="block w-full p-2 mb-2 border rounded" />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="block w-full p-2 mb-2 border rounded" />
      <input name="phone" placeholder="Telefono" value={form.phone} onChange={handleChange} required className="block w-full p-2 mb-4 border rounded" />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Iscriviti</button>
      {message && <p className={`mt-3 ${message.startsWith('❌') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
    </form>
  );
}
