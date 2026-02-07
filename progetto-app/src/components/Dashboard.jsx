// src/components/Dashboard.jsx
import { Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, Calendar, User, LogOut, Shield, ShoppingBag, Trophy, Zap, Star, ShoppingCart } from 'lucide-react';
import { supabase } from '../supabaseClient';

import ProfilePage from './ProfilePage';
import TournamentViewOnly from './TournamentViewOnly';
import MarketplaceGestion from './MarketplaceGestion';

export default function Dashboard() {
  const { user, signOut, role } = useAuth();
  const isAdmin = role === 'superadmin' || role === 'admin'; // ✅ superadmin incluso
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [userStats, setUserStats] = useState({
    tournaments: 12,
    points: 1247,
    rank: 47,
    nextEvent: 'Bari Winter Cup - 15 Dic'
  });
  const [currentBanner, setCurrentBanner] = useState(0);
  const [bannerImages, setBannerImages] = useState([]);

  useEffect(() => {
    if (user) {
      const stats = {
        tournaments: 12 + Math.floor(Math.random() * 5),
        points: 1247 + Math.floor(Math.random() * 100),
        rank: Math.max(1, 47 - Math.floor(Math.random() * 3)),
        nextEvent: 'Bari Winter Cup - 15 Dic'
      };
      setUserStats(stats);
    }
  }, [user]);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace_items')
          .select('immagine_url')
          .eq('venduto', false)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;

        const images = data?.filter(item => item.immagine_url && item.immagine_url.trim() !== '').map(item => item.immagine_url) || [];
        setBannerImages(images.length > 0 ? images : [
          'https://images.unsplash.com/photo-1620102408085-8c9dfd5a2b6f?w=1200&h=400&fit=crop'
        ]);
      } catch (err) {
        console.error('Banner fetch error:', err);
        setBannerImages([
          'https://images.unsplash.com/photo-1620102408085-8c9dfd5a2b6f?w=1200&h=400&fit=crop'
        ]);
      }
    };
    fetchBanner();
  }, []);

  useEffect(() => {
    if (bannerImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [bannerImages]);

  const menuItems = isAdmin ? [
    { id: 'home', label: 'Dashboard', icon: Home, section: 'home' },
    { id: 'admin', label: 'Gestione Tornei', icon: Shield, section: 'admin-tornei' },
    { id: 'eventi', label: 'Eventi e Tornei', icon: Calendar, section: 'tornei' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, section: 'marketplace-gestione' },
    { id: 'profilo', label: 'Profilo', icon: User, section: 'profilo' },
    { id: 'logout', label: 'Logout', icon: LogOut, section: 'logout' }
  ] : [
    { id: 'home', label: 'Dashboard', icon: Home, section: 'home' },
    { id: 'eventi', label: 'Eventi e Tornei', icon: Calendar, section: 'tornei' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, section: 'marketplace' },
    { id: 'profilo', label: 'Profilo', icon: User, section: 'profilo' },
    { id: 'logout', label: 'Logout', icon: LogOut, section: 'logout' }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const SidebarMenu = () => (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300 ease-in-out"
      onClick={() => setIsOpen(false)}
    >
      <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 pt-20 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Menu</h2>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-all">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{user?.email?.split('@')[0]?.replace(/\./g, ' ') || 'Giocatore'}</p>
                <p className="text-xs text-gray-500">{isAdmin ? 'Admin' : 'Giocatore'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.section);
                setIsOpen(false);
                if (item.id === 'logout') handleLogout();
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-medium transition-all group text-left ${activeSection === item.section ? 'bg-emerald-50 text-emerald-700 shadow-md border border-emerald-200' : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'} ${item.id === 'logout' ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : ''}`}
            >
              <item.icon className={`w-6 h-6 flex-shrink-0 ${activeSection === item.section ? 'text-emerald-600' : item.id === 'logout' ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-600'}`} />
              <span className="text-base font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const AccessDenied = () => (
    <div className="p-12 max-w-6xl mx-auto text-center">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 md:p-12 shadow-md mx-auto max-w-sm border border-red-200">
        <Shield className="w-20 h-20 md:w-24 md:h-24 text-red-400 mx-auto mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-4">Accesso Negato</h2>
        <p className="text-base md:text-lg text-red-500 mb-8">Questa sezione è riservata agli amministratori.</p>
        <button
          onClick={() => setActiveSection('home')}
          className="px-6 py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl shadow transition-all text-sm md:text-base"
        >
          ← Torna alla Dashboard
        </button>
      </div>
    </div>
  );

  const renderSection = () => {
    switch(activeSection) {
      case 'home': return <div>Benvenuto nella Dashboard</div>;
      case 'tornei': return <TournamentViewOnly />;
      case 'admin-tornei': return isAdmin ? <MarketplaceGestion /> : <AccessDenied />;
      case 'marketplace-gestione': return isAdmin ? <MarketplaceGestion /> : <AccessDenied />;
      case 'profilo': return <ProfilePage logout={handleLogout} />;
      case 'logout': handleLogout(); return <div className="p-12 text-center text-green-700 bg-white/80 rounded-2xl shadow-md border border-green-200">Logout in corso...</div>;
      default: return <div className="p-12 text-center text-green-700 bg-white/80 rounded-2xl shadow-md border border-green-200">Sezione non trovata</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="bg-white/90 backdrop-blur-sm border-b border-green-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg md:rounded-xl hover:bg-green-50 transition-all group"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-green-700" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-green-700 flex-1 text-center">
            CieffePadel
            {isAdmin && (
              <span className="ml-2 px-2 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs md:text-sm font-bold rounded-full shadow">
                ADMIN
              </span>
            )}
          </h1>
          <div className="w-12 md:w-0"></div>
        </div>
      </header>

      {isOpen && <SidebarMenu />}
      <main className="pt-2 pb-8 md:pb-12">{renderSection()}</main>
    </div>
  );
}
