// App.jsx - CORRETTO CON UPDATE-PASSWORD
import ResetPasswordConfirm from "./components/ResetPasswordConfirm";
import UpdatePassword from "./components/UpdatePassword";  // ✅ AGGIUNTO
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthProvider";

// PUBLIC
import LoginPages from "./components/LoginPages";
import RegistrationPage from "./components/RegistrationPage";
import ResetPasswordFinal from "./components/ResetPasswordFinal";

// DASHBOARD
import Dashboard from "./components/Dashboard";
import ProfilePage from "./components/ProfilePage";
import MarketplaceList from "./components/MarketplaceList";     
import Marketplace from "./components/Marketplace";            

// TORNEI
import TournamentList from "./components/TournamentList";
import SingleTournament from "./components/SingleTournament";
import TournamentListAndAdmin from "./components/TournamentListAndAdmin";
import TournamentAdminPanel from "./components/TournamentAdminPanel";
import EventiTornei from "./components/EventiTornei";

// ADMIN MARKETPLACE
import MarketplaceAdmin from "./components/MarketplaceAdmin";
import MarketplaceGestion from "./components/MarketplaceGestion";
import MarketplaceUser from "./components/MarketplaceUser";

// TABELLONI PADEL
import PadelBracket from "./components/PadelBracket";
import TabelloneRipescaggi from "./components/TabelloneRipescaggi";

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
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.user_metadata.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ✅ PUBLIC ROUTES - RESET PASSWORD */}
          <Route path="/" element={<LoginPages />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/reset-password" element={<ResetPasswordFinal />} />
          <Route path="/update-password" element={<UpdatePassword />} />  {/* ✅ FIX 404 */}

          {/* DASHBOARD ROUTES */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          {/* ✅ MARKETPLACE ROUTES */}
          <Route path="/marketplace" element={<ProtectedRoute><MarketplaceList /></ProtectedRoute>} />
          <Route path="/marketplace/main" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/marketplace/user" element={<ProtectedRoute><MarketplaceUser /></ProtectedRoute>} />
          
          {/* ✅ ADMIN MARKETPLACE */}
          <Route path="/marketplace-admin" element={<ProtectedRoute adminOnly><MarketplaceAdmin /></ProtectedRoute>} />
          <Route path="/admin/marketplace" element={<ProtectedRoute adminOnly><MarketplaceAdmin /></ProtectedRoute>} />
          <Route path="/admin/marketplace-gestion" element={<ProtectedRoute adminOnly><MarketplaceGestion /></ProtectedRoute>} />

          {/* TORNEI ROUTES */}
          <Route path="/tournaments" element={<ProtectedRoute><TournamentList /></ProtectedRoute>} />
          <Route path="/eventi-tornei" element={<ProtectedRoute><EventiTornei /></ProtectedRoute>} />
          <Route path="/tournaments/:tournamentId" element={<ProtectedRoute><SingleTournament /></ProtectedRoute>} />
          <Route path="/eventi-tornei/:torneoId" element={<ProtectedRoute><SingleTournament /></ProtectedRoute>} />
          <Route path="/tabellone/:tournamentId" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />
          <Route path="/bracket/:id" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />
          <Route path="/tabellone-coppa" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />
          <Route path="/ripescaggi/:tournamentId" element={<ProtectedRoute><TabelloneRipescaggi /></ProtectedRoute>} />

          {/* ADMIN TORNEI */}
          <Route path="/admin-tournaments" element={<ProtectedRoute><TournamentAdminPanel /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><TournamentListAndAdmin /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
