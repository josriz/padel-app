// src/components/Profilo.jsx - ✅ PLAYTONIC STYLE + SFONDO PROFILO
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { LogOut, User, Mail, Shield, Loader2, AlertCircle, Trophy, Zap, Calendar, MapPin, Phone, Star } from 'lucide-react';

const Profilo = ({ logout: propLogout }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);

  const handleLogout = async () => {
    if (propLogout) await propLogout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat px-2 sm:px-4 relative overflow-hidden" 
           style={{ backgroundImage: "url('/images/sfondo-profilo.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 z-0"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-6">
          <div className="text-center bg-white/90 p-12 rounded-3xl shadow-2xl border border-white/50 max-w-md backdrop-blur-xl">
            <AlertCircle className="w-20 h-20 text-red-300 mx-auto mb-6 drop-shadow-2xl" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2 drop-shadow-lg">Login richiesto</h3>
            <p className="text-gray-700 mb-8 leading-relaxed drop-shadow-md">Effettua il login per visualizzare il profilo PadelClub</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat px-2 sm:px-4 relative overflow-hidden" 
         style={{ backgroundImage: "url('/images/sfondo-profilo.jpg')" }}>
      
      {/* Overlay ultra-trasparente */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/8 to-black/25 z-0"></div>
      
      <div className="relative z-10 flex-1 flex flex-col min-h-screen">
        <div className="p-6 max-w-4xl mx-auto space-y-8 flex-1 pt-12 pb-12">
          {/* ✅ HERO HEADER PLAYTONIC */}
          <div className="text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 blur-xl"></div>
            <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl border-4 border-white/80 relative ring-4 ring-white/30 group-hover:ring-emerald-200/50 transition-all backdrop-blur-sm">
              <User className="w-12 h-12 text-white drop-shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-3xl animate-pulse opacity-75"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-indigo-100 to-emerald-100 bg-clip-text text-transparent mb-3 drop-shadow-2xl tracking-tight">
              {user?.email?.split('@')[0]?.replace(/\./g, ' ') || 'Padel Player'}
            </h1>
            
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 rounded-2xl backdrop-blur-sm shadow-2xl border border-white/60 mb-8 drop-shadow-xl">
              <Mail className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900 truncate max-w-xs">{user?.email}</span>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
              <span className="px-4 py-2 bg-white/90 text-indigo-800 text-sm font-bold rounded-full shadow-lg backdrop-blur-sm border border-indigo-200/50 drop-shadow-md">
                {isAdmin ? '👑 ADMINISTRATOR' : '🎾 PLAYER'}
              </span>
              <span className="px-4 py-2 bg-white/90 text-emerald-800 text-sm font-bold rounded-full shadow-lg backdrop-blur-sm border border-emerald-200/50 drop-shadow-md">
                ID: {user?.id?.slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* ✅ STATS CARDS ANIMATED */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="group bg-white/95 p-6 rounded-3xl shadow-2xl border border-white/70 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-md drop-shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform border-2 border-white/50">
                <Trophy className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2 drop-shadow-md">Tornei Partecipati</h3>
              <p className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center drop-shadow-lg">12</p>
              <p className="text-sm text-gray-600 text-center mt-1 drop-shadow-sm">Ultimo: Bari Open 2025</p>
            </div>

            <div className="group bg-white/95 p-6 rounded-3xl shadow-2xl border border-white/70 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-md drop-shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform border-2 border-white/50">
                <Zap className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2 drop-shadow-md">Punti PadelClub</h3>
              <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-center drop-shadow-lg">1.247</p>
              <p className="text-sm text-emerald-700 text-center mt-1 font-semibold drop-shadow-sm">+150 questo mese</p>
            </div>

            <div className="group bg-white/95 p-6 rounded-3xl shadow-2xl border border-white/70 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-md drop-shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform border-2 border-white/50">
                <Star className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2 drop-shadow-md">Ranking Puglia</h3>
              <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center drop-shadow-lg">#47</p>
              <p className="text-sm text-purple-700 text-center mt-1 drop-shadow-sm">Top 5% regionale</p>
            </div>
          </div>

          {/* ✅ INFO CARD PRINCIPALE */}
          <div className="bg-white/95 rounded-3xl shadow-3xl border border-white/70 p-8 backdrop-blur-xl hover:shadow-4xl transition-all hover:-translate-y-1 drop-shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 drop-shadow-lg">
              <Shield className="w-8 h-8 text-indigo-600 drop-shadow-md" />
              Dettagli Account
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group p-6 bg-gradient-to-b from-indigo-50/90 to-white/90 rounded-2xl border border-indigo-200/60 hover:border-indigo-300/80 transition-all backdrop-blur-sm shadow-lg hover:shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 drop-shadow-sm">ID Unico</h4>
                </div>
                <p className="text-2xl font-black text-indigo-700 drop-shadow-lg">{user?.id?.slice(0, 8)}...</p>
              </div>

              <div className="group p-6 bg-gradient-to-b from-emerald-50/90 to-white/90 rounded-2xl border border-emerald-200/60 hover:border-emerald-300/80 transition-all backdrop-blur-sm shadow-lg hover:shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 drop-shadow-sm">Email Verificata</h4>
                </div>
                <p className="text-lg font-semibold text-emerald-700 truncate max-w-sm drop-shadow-md">{user?.email}</p>
              </div>

              <div className="group p-6 bg-gradient-to-b from-purple-50/90 to-white/90 rounded-2xl border border-purple-200/60 hover:border-purple-300/80 transition-all backdrop-blur-sm shadow-lg hover:shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 drop-shadow-sm">Membro dal</h4>
                </div>
                <p className="text-lg font-semibold text-purple-700 drop-shadow-md">Novembre 2025</p>
              </div>

              <div className="group p-6 bg-gradient-to-b from-orange-50/90 to-white/90 rounded-2xl border border-orange-200/60 hover:border-orange-300/80 transition-all md:col-span-2 lg:col-span-1 backdrop-blur-sm shadow-lg hover:shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 drop-shadow-sm">Posizione</h4>
                </div>
                <p className="text-lg font-semibold text-orange-700 drop-shadow-md">Bari, Puglia 🇮🇹</p>
              </div>

              <div className="group p-6 bg-gradient-to-b from-teal-50/90 to-white/90 rounded-2xl border border-teal-200/60 hover:border-teal-300/80 transition-all md:col-span-2 lg:col-span-1 backdrop-blur-sm shadow-lg hover:shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-100/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Phone className="w-5 h-5 text-teal-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 drop-shadow-sm">Contatti</h4>
                </div>
                <p className="text-lg font-semibold text-teal-700 drop-shadow-md">WhatsApp disponibile</p>
              </div>
            </div>
          </div>

          {/* ✅ ADMIN PANEL EXTRA */}
          {isAdmin && (
            <div className="bg-white/90 backdrop-blur-md text-gray-900 p-8 rounded-3xl shadow-3xl border border-white/70 drop-shadow-2xl hover:shadow-4xl hover:-translate-y-2 transition-all">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3 drop-shadow-lg">
                <Shield className="w-10 h-10 text-indigo-600 drop-shadow-xl" />
                Admin Control Panel
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-2xl hover:bg-indigo-500/30 transition-all backdrop-blur-sm border border-indigo-200/50">
                  <h4 className="font-bold mb-2 text-indigo-900 drop-shadow-md">Super Admin</h4>
                  <p className="text-indigo-800 drop-shadow-sm">Accesso totale sistema</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-6 rounded-2xl hover:bg-emerald-500/30 transition-all backdrop-blur-sm border border-emerald-200/50">
                  <h4 className="font-bold mb-2 text-emerald-900 drop-shadow-md">Gestione Utenti</h4>
                  <p className="text-emerald-800 drop-shadow-sm">CRUD completo utenti</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-2xl hover:bg-purple-500/30 transition-all backdrop-blur-sm border border-purple-200/50">
                  <h4 className="font-bold mb-2 text-purple-900 drop-shadow-md">Analytics</h4>
                  <p className="text-purple-800 drop-shadow-sm">Statistiche avanzate</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ LOGOUT BUTTON PREMIUM */}
          <div className="pt-8 border-t border-white/30">
            <button
              onClick={handleLogout}
              className="w-full group flex items-center justify-center gap-4 py-4 px-8 bg-gradient-to-r from-red-500 via-red-600 to-orange-600 text-white font-black text-lg rounded-3xl shadow-3xl hover:shadow-4xl hover:-translate-y-1 transition-all duration-300 border-2 border-white/40 backdrop-blur-md relative overflow-hidden drop-shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent -skew-x-12 group-hover:translate-x-2 transition-transform"></div>
              <LogOut className="w-6 h-6 relative group-hover:scale-110 transition-transform drop-shadow-lg" />
              <span className="relative tracking-wide drop-shadow-md">Esci dal Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profilo;
