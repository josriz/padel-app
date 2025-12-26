// src/components/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Menu, Trophy, User, LogOut, Edit3, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',           
    cognome: '',        
    full_name: '',
    email: '',
    telefono: '',
    livello_padel: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Banner carousel
  const [carouselIndex, setCarouselIndex] = useState(0);
  const foto = ['mia-foto1.jpg', 'mia-foto2.jpg', 'mia-foto3.jpg', 'mia-foto4.jpg', 'mia-foto5.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % foto.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [foto.length]);

  useEffect(() => {
    if (!user) {
      navigate('/dashboard');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setProfile(data);
        setFormData({
          nome: data.nome || '',
          cognome: data.cognome || '',
          full_name: data.full_name || '',
          email: user.email || '',
          telefono: data.telefono || '',
          livello_padel: data.livello_padel || '',
          bio: data.bio || ''
        });
      }
    } catch (error) {
      console.error('Errore fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const updates = {
        nome: formData.nome,
        cognome: formData.cognome,
        full_name: `${formData.nome} ${formData.cognome}`.trim(),
        telefono: formData.telefono,
        livello_padel: formData.livello_padel,
        bio: formData.bio
      };
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      setProfile({ ...profile, ...updates });
      setEditing(false);
      alert('✅ Profilo salvato!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .single();
      if (updateError) throw updateError;
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      alert('✅ Foto caricata!');
    } catch (error) {
      alert('❌ Errore: ' + error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-2 sm:px-4 relative overflow-hidden" 
           style={{ backgroundImage: "url('/images/sfondo-profilo.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 z-0"></div>
        <div className="relative z-10">
          <Loader2 className="w-12 h-12 text-white drop-shadow-2xl animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat px-2 sm:px-4 relative overflow-hidden" 
         style={{ backgroundImage: "url('/images/sfondo-profilo.jpg')" }}>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/15 z-0"></div>

      {/* BANNER SOPRA FORM */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-xl mx-auto mt-6 bg-cover bg-center bg-no-repeat" 
           style={{ backgroundImage: "url('/images/sfondo-banner-logo.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/30 backdrop-blur-sm"></div>
        <div className="relative z-10 flex items-center gap-4 pl-4 sm:pl-6 pr-4 pb-4 pt-2 sm:pt-4 h-28 sm:h-32 md:h-36 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border-3 sm:border-2 border-white/80 bg-white/95">
              <img src="/logo.png" alt="Cieffe Padel Club" className="w-full h-full object-contain p-1 sm:p-1"/>
            </div>
            <div className="text-white drop-shadow-2xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">CIEFFE</h1>
              <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide -mt-1">PADEL CLUB</p>
            </div>
          </div>
          <button onClick={() => setMenuOpen(true)} className="p-3 bg-emerald-50/90 border border-emerald-200/60 rounded-xl hover:bg-emerald-100 shadow-lg backdrop-blur-sm drop-shadow-lg">
            <Menu className="w-6 h-6 text-emerald-700" />
          </button>
        </div>
        <div className="absolute bottom-2 right-3 text-xs sm:text-sm font-bold text-white/95 italic bg-black/60 px-2 py-1 rounded-full shadow-lg">
          by Claudio Falba
        </div>
      </div>

      {/* FORM COMPATTO CON AVATAR ACCANTO AL TITOLO */}
      <div className="relative z-10 pt-6 px-6 flex justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-lg">
            {/* HEADER FORM + AVATAR */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                👤 I miei dati
              </h3>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-white text-2xl flex items-center justify-center h-full w-full">👤</span>
                )}
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    📸
                  </label>
                )}
              </div>
            </div>

            {/* FORM INPUTS */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-1">Nome *</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm ${editing ? 'border-blue-300 bg-white focus:ring-1 focus:ring-blue-400 text-gray-900' : 'border-gray-200 bg-white/80 cursor-not-allowed text-gray-900'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">Cognome *</label>
                <input type="text" value={formData.cognome} onChange={(e) => setFormData({...formData, cognome: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm ${editing ? 'border-blue-300 bg-white focus:ring-1 focus:ring-blue-400 text-gray-900' : 'border-gray-200 bg-white/80 cursor-not-allowed text-gray-900'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">Email</label>
                <div className="bg-white/80 p-2 border border-gray-200 rounded-lg text-sm font-mono text-gray-900">{formData.email}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">Telefono</label>
                <input type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm ${editing ? 'border-emerald-300 bg-white focus:ring-1 focus:ring-emerald-400 text-gray-900' : 'border-gray-200 bg-white/80 cursor-not-allowed text-gray-900'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">Livello Padel</label>
                <select value={formData.livello_padel} onChange={(e) => setFormData({...formData, livello_padel: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm ${editing ? 'border-purple-300 bg-white focus:ring-1 focus:ring-purple-400 text-gray-900' : 'border-gray-200 bg-white/80 cursor-not-allowed text-gray-900'}`}>
                  <option value="">Seleziona</option>
                  <option value="Principiante">🥚 Principiante</option>
                  <option value="Intermedio">🥉 Intermedio</option>
                  <option value="Avanzato">🥈 Avanzato</option>
                  <option value="Esperto">🥇 Esperto</option>
                  <option value="Pro">⚡ Pro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">Bio</label>
                <textarea rows="2" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm resize-none ${editing ? 'border-indigo-300 bg-white focus:ring-1 focus:ring-indigo-400 text-gray-900' : 'border-gray-200 bg-white/80 cursor-not-allowed text-gray-900'}`} 
                  placeholder="Descriviti brevemente..." />
              </div>
            </div>

            {/* PULSANTI MODIFICA / SALVA */}
            <div className="flex gap-2 mt-4">
              {editing ? (
                <>
                  <button onClick={handleSaveProfile} disabled={saveLoading} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
                    {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Salva
                  </button>
                  <button onClick={() => {setEditing(false); fetchProfile();}} className="bg-gray-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    Annulla
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
                  <Edit3 className="w-4 h-4" /> Modifica
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
