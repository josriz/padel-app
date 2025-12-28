// src/components/ProfilePage.jsx - ? COLORI DASHBOARD EMERALD/TEAL
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { LogOut, Shield, AlertCircle } from 'lucide-react';

const ProfilePage = ({ logout: propLogout }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (propLogout) await propLogout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl border max-w-sm backdrop-blur w-full text-center">
          <svg className="w-16 h-16 text-emerald-400 mx-auto mb-4 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11a9.39 9.39 0 0 0 9-11V7l-10-5z"/>
          </svg>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Login richiesto</h3>
          <p className="text-slate-600">Effettua il login per il profilo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white/80 to-cyan-50 p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* HEADER con AVATAR 3D */}
      <div className="text-center relative overflow-hidden group">
        <div className="relative mx-auto mb-4 w-20 h-20 shadow-2xl group-hover:shadow-emerald-500/25 transition-all duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white relative overflow-hidden">
            <svg className="w-12 h-12 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-transparent rounded-2xl blur animate-pulse opacity-60"></div>
          </div>
        </div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 bg-clip-text text-transparent mb-1">
          {user?.email?.split('@')[0]?.replace(/\./g, ' ') || 'Player'}
        </h1>
        <p className="text-sm text-slate-600 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-emerald-500 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {isAdmin ? '?? Admin' : '?? Player'}
        </p>
      </div>

      {/* STATS con ICONE 3D */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 via-white/90 to-emerald-100/50 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-emerald-200/50 text-center group hover:shadow-2xl hover:-translate-y-1.5 hover:border-emerald-300 transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
            <svg className="w-6 h-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <p className="text-xl font-bold text-emerald-800">{12}</p>
          <p className="text-xs text-emerald-600 font-semibold tracking-wide">Tornei</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500/10 via-white/90 to-teal-100/50 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-teal-200/50 text-center group hover:shadow-2xl hover:-translate-y-1.5 hover:border-teal-300 transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
            <svg className="w-6 h-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
            </svg>
          </div>
          <p className="text-xl font-bold text-teal-800">1.247</p>
          <p className="text-xs text-teal-600 font-semibold tracking-wide">Punti</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 via-white/90 to-cyan-100/50 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-cyan-200/50 text-center group hover:shadow-2xl hover:-translate-y-1.5 hover:border-cyan-300 transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
            <svg className="w-6 h-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
          <p className="text-xl font-bold text-cyan-800">#47</p>
          <p className="text-xs text-cyan-600 font-semibold tracking-wide">Rank</p>
        </div>
      </div>

      {/* INFO con ICONE SVG */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-100/50 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-600 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
          </svg>
          Account Info
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl group hover:shadow-md transition-all border border-emerald-200/30">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">ID Profilo</p>
              <p className="font-mono font-bold text-emerald-800 truncate">{user?.id?.slice(0, 12)}...</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-xl group hover:shadow-md transition-all border border-teal-200/30">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Email</p>
              <p className="font-semibold text-teal-800 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-cyan-100/50 rounded-xl group hover:shadow-md transition-all border border-cyan-200/30">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Località</p>
              <p className="text-2xl font-black text-cyan-800">Bari ????</p>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-emerald-500/90 to-teal-600/90 backdrop-blur-xl text-white p-6 rounded-2xl shadow-2xl border border-emerald-300/50">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
            <h3 className="font-black text-lg">Super Admin</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs font-semibold">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm text-center shadow-md">?? Utenti</div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm text-center shadow-md">?? Tornei</div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm text-center shadow-md">?? Stats</div>
          </div>
        </div>
      )}

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border-0 text-sm group relative overflow-hidden"
      >
        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Esci
      </button>
    </div>
  );
};

export default ProfilePage;
