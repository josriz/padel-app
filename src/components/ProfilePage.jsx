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
        full_name: formData.full_name,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-white/95 backdrop-blur-md border-b px-6 py-4 flex items-center justify-center shadow-lg">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="p-3 bg-gray-50 border rounded-xl hover:bg-gray-100 shadow-md">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            👤 Profilo
          </h1>
          <button onClick={() => setMenuOpen(true)} className="p-3 bg-emerald-50 border rounded-xl hover:bg-emerald-100 shadow-md">
            <Menu className="w-6 h-6 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex justify-end" onClick={() => setMenuOpen(false)}>
          <div className="w-80 bg-white shadow-2xl h-full flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <Link to="/dashboard" className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border font-semibold" onClick={() => setMenuOpen(false)}>
                <Home className="w-5 h-5 text-blue-600" /> Dashboard
              </Link>
              <Link to="/tournaments" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border-emerald-200 font-semibold" onClick={() => setMenuOpen(false)}>
                <Trophy className="w-5 h-5 text-emerald-600" /> Tornei
              </Link>
              <Link to="/profile" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border-blue-200 font-bold" onClick={() => setMenuOpen(false)}>
                <User className="w-5 h-5 text-blue-600" /> Profilo
              </Link>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl text-red-600 hover:bg-red-50 border font-semibold mt-6" onClick={() => window.location.href = '/'}>
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENUTO */}
      <div className="pt-20 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* CARD DATI - TAS TO MODIFICA RIPRISTINATO */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">👤 I miei dati</h3>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button 
                      onClick={handleSaveProfile} 
                      disabled={saveLoading} 
                      className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-1 hover:shadow-xl transition-all"
                    >
                      {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Salva
                    </button>
                    <button 
                      onClick={() => {setEditing(false); fetchProfile();}} 
                      className="bg-gray-500 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                      Annulla
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setEditing(true)} 
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modifica
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <div className="bg-gray-50 p-3 border rounded-xl text-sm font-mono">{formData.email}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
                <input 
                  type="text" 
                  value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  disabled={!editing}
                  className={`w-full p-3 border rounded-xl text-base font-semibold ${editing ? 'border-gray-300 focus:ring-2 focus:ring-blue-400' : 'bg-white border-gray-200 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefono</label>
                <input 
                  type="tel" 
                  value={formData.telefono} 
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  disabled={!editing}
                  className={`w-full p-3 border rounded-xl text-base ${editing ? 'border-gray-300 focus:ring-2 focus:ring-emerald-400' : 'bg-white border-gray-200 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Livello Padel</label>
                <select 
                  value={formData.livello_padel} 
                  onChange={(e) => setFormData({...formData, livello_padel: e.target.value})}
                  disabled={!editing}
                  className={`w-full p-3 border rounded-xl text-base font-semibold ${editing ? 'border-gray-300 focus:ring-2 focus:ring-purple-400' : 'bg-white border-gray-200 cursor-not-allowed'}`}
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                <textarea 
                  rows="2" 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  disabled={!editing}
                  className={`w-full p-3 border rounded-xl text-base ${editing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-400' : 'bg-white border-gray-200 cursor-not-allowed'}`} 
                  placeholder="Descriviti brevemente..."
                />
              </div>
            </div>
          </div>

          {/* CARD AVATAR */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">🖼️ Avatar</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-400 to-emerald-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden border-4 border-white">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  profile?.full_name?.charAt(0)?.toUpperCase() || '👤'
                )}
              </div>
              {editing && (
                <label className="bg-emerald-600 text-white p-3 rounded-xl shadow-lg cursor-pointer hover:shadow-xl flex items-center gap-2 text-sm font-bold transition-all">
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
