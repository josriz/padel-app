// src/App.jsx - ✅ ISCRIZIONI + ADMIN BOTTONI ROSSI FUNZIONANTI + MARKETPLACE COMPLETO + TABELLONE COPPA ITALIA
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthProvider";

// 🌟 PUBLIC
import LoginPages from "./components/LoginPages";
import RegistrationPage from "./components/RegistrationPage";

// 👤 DASHBOARD
import Dashboard from "./components/Dashboard";
import ProfilePage from "./components/ProfilePage";
import Marketplace from "./components/Marketplace";  // ✅ Lista pubblica
import MarketplaceList from "./components/MarketplaceList";  // ✅ Lista grid 4-colonne

// 🏆 TORNEI
import TournamentList from "./components/TournamentList";
import SingleTournament from "./components/SingleTournament";
import TournamentListAndAdmin from "./components/TournamentListAndAdmin";
import TournamentAdminPanel from "./components/TournamentAdminPanel";  // ✅ BOTTONI ROSSI
import EventiTornei from "./components/EventiTornei";

// ⚙️ ADMIN MARKETPLACE
import MarketplaceAdmin from "./components/MarketplaceAdmin";  // ✅ Admin panel completo
import MarketplaceGestion from "./components/MarketplaceGestion";  // ✅ Gestione admin
import MarketplaceUser from "./components/MarketplaceUser";  // ✅ Utente suoi prodotti

// 📱 TABELLONE + COPPA ITALIA
import PadelBracket from "./components/PadelBracket";  // ✅ IL TUO TABELLONE DRAG&DROP!

// 404
import NotFound from "./components/NotFound";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
    </div>
  );
}

// ✅ FIXED ProtectedRoute - FUNZIONA CON LINK DIRETTO!
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, role, loading } = useAuth();

  if (loading || !user || !user.user_metadata) {
    return <LoadingSpinner />;
  }
  
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.user_metadata.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<LoginPages />} />
          <Route path="/register" element={<RegistrationPage />} />

          {/* DASHBOARD */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          {/* 🛒 MARKETPLACE */}
          <Route path="/marketplace" element={<ProtectedRoute><MarketplaceList /></ProtectedRoute>} />  {/* ✅ Lista principale */}
          <Route path="/marketplace/simple" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />  {/* ✅ Versione semplice */}
          
          {/* 👤 MARKETPLACE UTENTE */}
          <Route path="/marketplace/user" element={<ProtectedRoute><MarketplaceUser /></ProtectedRoute>} />  {/* ✅ I suoi prodotti */}
          
          {/* 👑 MARKETPLACE ADMIN */}
          <Route path="/admin/marketplace" element={<ProtectedRoute adminOnly={true}><MarketplaceAdmin /></ProtectedRoute>} />  {/* ✅ Admin completo */}
          <Route path="/admin/marketplace-gestion" element={<ProtectedRoute adminOnly={true}><MarketplaceGestion /></ProtectedRoute>} />  {/* ✅ Gestione admin */}

          {/* 🏆 TORNEI UTENTI */}
          <Route path="/tournaments" element={<ProtectedRoute><TournamentList /></ProtectedRoute>} />
          <Route path="/eventi-tornei" element={<ProtectedRoute><TournamentList /></ProtectedRoute>} />
          <Route path="/tournaments/:tournamentId" element={<ProtectedRoute><SingleTournament /></ProtectedRoute>} />
          <Route path="/eventi-tornei/:torneoId" element={<ProtectedRoute><SingleTournament /></ProtectedRoute>} />

          {/* ✅ ADMIN TORNEI CON BOTTONI ROSSI */}
          <Route path="/admin-tournaments" element={<ProtectedRoute adminOnly={true}><TournamentAdminPanel /></ProtectedRoute>} />

          {/* ADMIN */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><TournamentListAndAdmin /></ProtectedRoute>} />

          {/* 🔥 TABELLONI - IL TUO PADELBRACKET! */}
          <Route path="/tabellone/:tournamentId" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />  {/* ✅ CORRETTO! */}
          <Route path="/tabellone-coppa" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />  {/* ✅ Coppa Italia */}

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
