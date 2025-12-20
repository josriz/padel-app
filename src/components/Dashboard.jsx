// src/components/Dashboard.jsx - SFONDO BANNER COLORATO
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Menu, X, Home, Trophy, User, LogOut, Shield, ShoppingBag, Crown } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();
  const token = localStorage.getItem('supabase.auth.token');
  const safeUser = user || (token ? { email: 'giose.rizzi@gmail.com' } : null);
  const isAdmin = role === 'admin';

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  const padelBanners = [
    "/images/mia-foto1.jpg",
    "/images/mia-foto2.jpg", 
    "/images/mia-foto3.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % padelBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = isAdmin ? [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'tornei', label: 'Tornei', icon: Trophy, path: '/tournaments' },
    { id: 'admin', label: 'Gestione Tornei', icon: Shield, path: '/admin-tournaments', admin: true },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { id: 'profilo', label: 'Profilo', icon: User, path: '/profile' },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ] : [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'tornei', label: 'Tornei', icon: Trophy, path: '/tournaments' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { id: 'profilo', label: 'Profilo', icon: User, path: '/profile' },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  const handleLogout = async () => {
    try {
      if (signOut) await signOut();
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  const HamburgerMenu = () => (
    <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button onClick={() => setMenuOpen(false)} className="p-3 rounded-xl hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const IconComponent = item.icon;
            if (item.admin && !isAdmin) return null;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMenuOpen(false);
                  if (item.id === 'logout') handleLogout();
                  else navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl font-semibold transition-all border ${
                  item.id === 'logout'
                    ? 'text-red-600 hover:bg-red-50 border-red-200'
                    : 'text-gray-900 hover:bg-gray-50 border-gray-200'
                } ${item.admin ? 'justify-between' : ''}`}
              >
                <IconComponent className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
                {item.admin && <Crown className="w-4 h-4 text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!safeUser) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* HEADER */}
      <div className="pt-12 pb-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          <button onClick={() => setMenuOpen(true)} className="mb-6 p-3 rounded-xl hover:bg-white shadow-sm border self-end">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-4xl font-black text-gray-900 text-center mb-4">Dashboard</h1>
          <p className="text-xl text-gray-600 text-center mb-8">Benvenuto nella tua Dashboard Padel!</p>
        </div>
      </div>

      {/* ✅ BANNER CON SFONDO GRADIENT PADEL */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="relative h-32 md:h-40 lg:h-48 rounded-2xl shadow-xl overflow-hidden border-4 border-white bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-600">
          {padelBanners.map((url, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}>
              <img 
                src={url}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
          ))}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl" />
          
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
            {padelBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentBanner
                    ? 'bg-white w-4 h-4 scale-125 shadow-md'
                    : 'bg-white/70 hover:bg-white hover:w-3 hover:h-3'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentBanner((prev) => (prev - 1 + padelBanners.length) % padelBanners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-lg text-lg font-bold hover:scale-110 shadow-lg"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentBanner((prev) => (prev + 1) % padelBanners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-lg text-lg font-bold hover:scale-110 shadow-lg"
          >
            ›
          </button>
        </div>
      </div>

      {menuOpen && <HamburgerMenu />}

      {/* CARDS */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-200">
            <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Tornei</h3>
            <p className="text-lg text-gray-600 mb-8 text-center">Scopri e iscriviti ai tornei</p>
            <button onClick={() => navigate('/tournaments')} className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg transition-all">
              VAI AI TORNEI →
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-200">
            <ShoppingBag className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Marketplace</h3>
            <p className="text-lg text-gray-600 mb-8 text-center">Acquista attrezzature padel</p>
            <button onClick={() => navigate('/marketplace')} className="w-full bg-emerald-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-lg transition-all">
              ESPLORA MARKET →
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-200">
            <User className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Profilo</h3>
            <p className="text-lg text-gray-600 mb-8 text-center">Gestisci il tuo account</p>
            <button onClick={() => navigate('/profile')} className="w-full bg-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-lg transition-all">
              MODIFICA PROFILO →
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">👑 Area Admin</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl p-10 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all">
                <Shield className="w-20 h-20 mx-auto mb-8" />
                <h3 className="text-2xl font-bold mb-6 text-center">Gestione Tornei</h3>
                <p className="text-xl mb-10 text-center opacity-90">Crea e modifica tornei</p>
                <button onClick={() => navigate('/admin-tournaments')} className="w-full bg-white text-blue-600 py-5 px-10 rounded-2xl font-bold text-xl hover:bg-gray-100 shadow-2xl transition-all">
                  GESTISCI TORNEI 👑
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
