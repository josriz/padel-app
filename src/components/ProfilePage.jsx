import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Menu, X, Home, Trophy, User, LogOut, Edit3, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
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

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/15 z-0"></div>

      {/* Logo in alto al centro */}
      <div className="flex justify-center pt-6 relative z-10">
        <img src="/logo.png" alt="Logo" className="w-32 h-auto" />
      </div>

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

      {/* MENU VERTICALE */}
      {menuOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex justify-end backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div className="w-56 bg-white/90 shadow-2xl h-full flex flex-col backdrop-blur-md border-l border-white/50 drop-shadow-2xl" onClick={e => e.stopPropagation()}>
            
            {/* Header menu */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Link menu verticale */}
            <div className="flex flex-col p-2 gap-2 overflow-y-auto flex-1">
              <Link to="/dashboard" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 font-semibold" onClick={() => setMenuOpen(false)}>
                <Home className="w-5 h-5 text-blue-600" /> Dashboard
              </Link>
              <Link to="/tournaments" className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 font-semibold" onClick={() => setMenuOpen(false)}>
                <Trophy className="w-5 h-5 text-emerald-600" /> Tornei
              </Link>
              <Link to="/profile" className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 font-bold" onClick={() => setMenuOpen(false)}>
                <User className="w-5 h-5 text-blue-600" /> Profilo
              </Link>
              <button className="flex items-center gap-2 p-3 rounded-lg text-red-600 hover:bg-red-50 font-semibold mt-2" onClick={() => window.location.href = '/'}>
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENUTO FORM E AVATAR COMPATTO */}
      <div className="relative z-10 pt-20 px-6 py-8 flex justify-center">
        <div className="w-full max-w-md space-y-6">
          
          {/* CARD DATI */}
          <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">👤 I miei dati</h3>
              <div className="flex gap-2">
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

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Nome *</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm ${editing ? 'border-blue-300 bg-white focus:ring-1 focus:ring-blue-400' : 'border-gray-200 bg-white/80 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Cognome *</label>
                <input type="text" value={formData.cognome} onChange={(e) => setFormData({...formData, cognome: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm ${editing ? 'border-blue-300 bg-white focus:ring-1 focus:ring-blue-400' : 'border-gray-200 bg-white/80 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
                <div className="bg-white/80 p-2 border border-gray-200 rounded-lg text-sm font-mono">{formData.email}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Telefono</label>
                <input type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm ${editing ? 'border-emerald-300 bg-white focus:ring-1 focus:ring-emerald-400' : 'border-gray-200 bg-white/80 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Livello Padel</label>
                <select value={formData.livello_padel} onChange={(e) => setFormData({...formData, livello_padel: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm ${editing ? 'border-purple-300 bg-white focus:ring-1 focus:ring-purple-400' : 'border-gray-200 bg-white/80 cursor-not-allowed'}`}>
                  <option value="">Seleziona</option>
                  <option value="Principiante">🥚 Principiante</option>
                  <option value="Intermedio">🥉 Intermedio</option>
                  <option value="Avanzato">🥈 Avanzato</option>
                  <option value="Esperto">🥇 Esperto</option>
                  <option value="Pro">⚡ Pro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Bio</label>
                <textarea rows="2" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} disabled={!editing}
                  className={`w-full p-2 border rounded-lg text-sm resize-none ${editing ? 'border-indigo-300 bg-white focus:ring-1 focus:ring-indigo-400' : 'border-gray-200 bg-white/80 cursor-not-allowed'}`} 
                  placeholder="Descriviti brevemente..." />
              </div>
            </div>
          </div>

          {/* CARD AVATAR */}
          <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-lg flex flex-col items-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🖼️ Avatar - {formData.nome} {formData.cognome}</h3>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-400 to-emerald-500 rounded-full flex items-center justify-center text-xl text-white shadow-md overflow-hidden border-4 border-white">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : profile?.full_name?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            {editing && (
              <label className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-xl cursor-pointer text-sm flex items-center gap-2">
                📸 Cambia foto
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
