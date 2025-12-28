import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Menu, Trophy, User, LogOut, Edit3, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import UserProfileMenu from "./UserProfileMenu";

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
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat px-2 sm:px-4 relative overflow-hidden"
         style={{ backgroundImage: "url('/images/sfondo-profilo.jpg')" }}>

      {/* BANNER */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-xl mx-auto mt-6 bg-cover bg-center bg-no-repeat"
           style={{ backgroundImage: "url('/images/sfondo-banner-logo.jpg')" }}>
        <div className="relative z-10 flex items-center justify-between p-4 h-28">
          <div className="text-white font-bold text-xl">CIEFFE PADEL CLUB</div>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-3 bg-white/90 rounded-xl shadow"
          >
            <Menu className="w-6 h-6 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="relative z-10 pt-6 px-6 flex justify-center">
        <div className="w-full max-w-md bg-white/80 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">👤 I miei dati</h3>

          <div className="grid gap-4">
            <input className="p-2 border rounded" value={formData.nome} disabled />
            <input className="p-2 border rounded" value={formData.cognome} disabled />
            <input className="p-2 border rounded" value={formData.email} disabled />
          </div>
        </div>
      </div>

      {/* MENU PROFILO - SEMPLICISSIMO */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-0 right-0 h-full w-full max-w-md bg-white z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <UserProfileMenu />
          </div>
        </div>
      )}

    </div>
  );
}
