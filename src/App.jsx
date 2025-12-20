// src/App.jsx - ✅ PADELBRACKET PER TUTTI I TABELLONI!
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthProvider";

// 🌟 PUBLIC
import LoginPages from "./components/LoginPages";
import RegistrationPage from "./components/RegistrationPage";

// 👤 DASHBOARD
import Dashboard from "./components/Dashboard";
import ProfilePage from "./components/ProfilePage";
import Marketplace from "./components/Marketplace";
import MarketplaceList from "./components/MarketplaceList";

// 🏆 TORNEI
import TournamentList from "./components/TournamentList";
import SingleTournament from "./components/SingleTournament";
import TournamentListAndAdmin from "./components/TournamentListAndAdmin";
import TournamentAdminPanel from "./components/TournamentAdminPanel";
import EventiTornei from "./components/EventiTornei";

// ⚙️ ADMIN MARKETPLACE
import MarketplaceAdmin from "./components/MarketplaceAdmin";
import MarketplaceGestion from "./components/MarketplaceGestion";
import MarketplaceUser from "./components/MarketplaceUser";

// 📱 NUOVO TABELLONE
import PadelBracket from "./components/PadelBracket";  // ✅ IL NUOVO TABELLONE!

// 404
import NotFound from "./components/NotFound";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
    </div>
  );
}

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
          <Route path="/marketplace" element={<ProtectedRoute><MarketplaceList /></ProtectedRoute>} />
          <Route path="/marketplace/simple" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/marketplace/user" element={<ProtectedRoute><MarketplaceUser /></ProtectedRoute>} />
          
          {/* 👑 MARKETPLACE ADMIN */}
          <Route path="/admin/marketplace" element={<ProtectedRoute adminOnly={true}><MarketplaceAdmin /></ProtectedRoute>} />
          <Route path="/admin/marketplace-gestion" element={<ProtectedRoute adminOnly={true}><MarketplaceGestion /></ProtectedRoute>} />

          {/* 🏆 TORNEI UTENTI */}
          <Route path="/tournaments" element={<ProtectedRoute><TournamentList /></ProtectedRoute>} />
          <Route path="/eventi-tornei" element={<ProtectedRoute><TournamentList /></ProtectedRoute>} />
          <Route path="/tournaments/:tournamentId" element={<ProtectedRoute><SingleTournament /></ProtectedRoute>} />
          <Route path="/eventi-tornei/:torneoId" element={<ProtectedRoute><SingleTournament /></ProtectedRoute>} />

          {/* ✅ NUOVO TABELLONE PADELBRACKET - PER TUTTO! */}
          <Route path="/tabellone/:tournamentId" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />
          
          {/* ✅ ADMIN TORNEI CON BOTTONI ROSSI */}
          <Route path="/admin-tournaments" element={<ProtectedRoute adminOnly={true}><TournamentAdminPanel /></ProtectedRoute>} />

          {/* ADMIN */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><TournamentListAndAdmin /></ProtectedRoute>} />

          {/* 🔥 PADELBRACKET OVUNQUE */}
          <Route path="/bracket/:id" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />
          <Route path="/tabellone-coppa" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
