import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Menu, X, Home, Trophy, User, Settings, LogOut, Edit3, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',           // ✅ AGGIUNTO
    cognome: '',        // ✅ AGGIUNTO
    full_name: '',
    email: '',
    telefono: '',
    livello_padel: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

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
          nome: data.nome || '',                    // ✅ AGGIUNTO
          cognome: data.cognome || '',              // ✅ AGGIUNTO
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
        nome: formData.nome,                      // ✅ AGGIUNTO
        cognome: formData.cognome,                // ✅ AGGIUNTO
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
      
      {/* Overlay ultra-trasparente */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/15 z-0"></div>

      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-white/80 backdrop-blur-md border-b border-white/50 px-6 py-4 flex items-center justify-center shadow-2xl drop-shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/90 border border-white/60 rounded-xl hover:bg-white shadow-lg backdrop-blur-sm drop-shadow-lg">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 drop-shadow-lg">
            👤 Profilo
          </h1>
          <button onClick={() => setMenuOpen(true)} className="p-3 bg-emerald-50/90 border border-emerald-200/60 rounded-xl hover:bg-emerald-100 shadow-lg backdrop-blur-sm drop-shadow-lg">
            <Menu className="w-6 h-6 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex justify-end backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div className="w-80 bg-white/90 shadow-2xl h-full flex flex-col backdrop-blur-md border-l border-white/50 drop-shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 drop-shadow-md">Menu</h2>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 backdrop-blur-sm">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <Link to="/dashboard" className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border border-gray-200 font-semibold backdrop-blur-sm shadow-sm" onClick={() => setMenuOpen(false)}>
                <Home className="w-5 h-5 text-blue-600" /> Dashboard
              </Link>
              <Link to="/tournaments" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border-emerald-200 font-semibold shadow-sm backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
                <Trophy className="w-5 h-5 text-emerald-600" /> Tornei
              </Link>
              <Link to="/profile" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border-blue-200 font-bold shadow-sm backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
                <User className="w-5 h-5 text-blue-600" /> Profilo
              </Link>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 font-semibold mt-6 shadow-sm backdrop-blur-sm" onClick={() => window.location.href = '/'}>
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENUTO */}
      <div className="relative z-10 pt-20 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* ✅ CARD DATI - CON NOME E COGNOME */}
          <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-8 shadow-2xl drop-shadow-xl hover:shadow-3xl hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-900 drop-shadow-2xl flex items-center gap-2">👤 I miei dati</h3>
              <div className="flex gap-3">
                {editing ? (
                  <>
                    <button 
                      onClick={handleSaveProfile} 
                      disabled={saveLoading} 
                      className="bg-emerald-600/90 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl flex items-center gap-2 hover:shadow-2xl transition-all backdrop-blur-sm border border-emerald-500/50 drop-shadow-lg"
                    >
                      {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                      Salva
                    </button>
                    <button 
                      onClick={() => {setEditing(false); fetchProfile();}} 
                      className="bg-gray-500/90 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all backdrop-blur-sm border border-gray-400/50 drop-shadow-lg"
                    >
                      Annulla
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setEditing(true)} 
                    className="bg-blue-600/90 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 backdrop-blur-sm border border-blue-500/50 drop-shadow-lg"
                  >
                    <Edit3 className="w-5 h-5" />
                    Modifica
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ✅ CAMPO NOME */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3 drop-shadow-lg">Nome *</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  disabled={!editing}
                  className={`w-full p-4 border-2 rounded-2xl text-xl font-bold shadow-lg backdrop-blur-sm transition-all ${
                    editing 
                      ? 'border-blue-300/70 bg-white/90 focus:ring-4 ring-blue-400/50 focus:border-blue-400/70' 
                      : 'border-gray-200/50 bg-white/80 cursor-not-allowed'
                  }`} 
                />
              </div>

              {/* ✅ CAMPO COGNOME */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3 drop-shadow-lg">Cognome *</label>
                <input 
                  type="text" 
                  value={formData.cognome}
                  onChange={(e) => setFormData({...formData, cognome: e.target.value})}
                  disabled={!editing}
                  className={`w-full p-4 border-2 rounded-2xl text-xl font-bold shadow-lg backdrop-blur-sm transition-all ${
                    editing 
                      ? 'border-blue-300/70 bg-white/90 focus:ring-4 ring-blue-400/50 focus:border-blue-400/70' 
                      : 'border-gray-200/50 bg-white/80 cursor-not-allowed'
                  }`} 
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3 drop-shadow-lg">Email</label>
                <div className="bg-white/80 p-4 border border-white/70 rounded-2xl text-lg font-mono drop-shadow-md backdrop-blur-sm">{formData.email}</div>
              </div>
              
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3 drop-shadow-lg">Telefono</label>
                <input 
                  type="tel" 
                  value={formData.telefono} 
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  disabled={!editing}
                  className={`w-full p-4 border-2 rounded-2xl text-xl shadow-lg backdrop-blur-sm transition-all ${
                    editing 
                      ? 'border-emerald-300/70 bg-white/90 focus:ring-4 ring-emerald-400/50 focus:border-emerald-400/70' 
                      : 'border-gray-200/50 bg-white/80 cursor-not-allowed'
                  }`} 
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3 drop-shadow-lg">Livello Padel</label>
                <select 
                  value={formData.livello_padel} 
                  onChange={(e) => setFormData({...formData, livello_padel: e.target.value})}
                  disabled={!editing}
                  className={`w-full p-4 border-2 rounded-2xl text-xl font-bold shadow-lg backdrop-blur-sm transition-all ${
                    editing 
                      ? 'border-purple-300/70 bg-white/90 focus:ring-4 ring-purple-400/50 focus:border-purple-400/70' 
                      : 'border-gray-200/50 bg-white/80 cursor-not-allowed'
                  }`}
                >
                  <option value="">Seleziona</option>
                  <option value="Principiante">🥚 Principiante</option>
                  <option value="Intermedio">🥉 Intermedio</option>
                  <option value="Avanzato">🥈 Avanzato</option>
                  <option value="Esperto">🥇 Esperto</option>
                  <option value="Pro">⚡ Pro</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-lg font-bold text-gray-800 mb-3 drop-shadow-lg">Bio</label>
                <textarea 
                  rows="3" 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  disabled={!editing}
                  className={`w-full p-4 border-2 rounded-2xl text-lg shadow-lg backdrop-blur-sm transition-all resize-vertical ${
                    editing 
                      ? 'border-indigo-300/70 bg-white/90 focus:ring-4 ring-indigo-400/50 focus:border-indigo-400/70' 
                      : 'border-gray-200/50 bg-white/80 cursor-not-allowed'
                  }`} 
                  placeholder="Descriviti brevemente..."
                />
              </div>
            </div>
          </div>

          {/* CARD AVATAR */}
          <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-8 shadow-2xl drop-shadow-xl hover:shadow-3xl hover:-translate-y-1 transition-all">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 drop-shadow-2xl flex items-center gap-2">
              🖼️ Avatar - {formData.nome} {formData.cognome}
            </h3>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32 bg-gradient-to-br from-blue-400/80 to-emerald-500/80 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl overflow-hidden border-8 border-white/70 backdrop-blur-sm drop-shadow-2xl">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  profile?.full_name?.charAt(0)?.toUpperCase() || '👤'
                )}
              </div>
              {editing && (
                <label className="bg-emerald-600/90 text-white p-4 rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl flex items-center gap-3 text-lg font-bold transition-all backdrop-blur-sm border border-emerald-500/50 drop-shadow-lg hover:-translate-y-1">
                  📸 Cambia foto
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
