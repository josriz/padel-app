// App.jsx - CORRETTO
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthProvider";


// PUBLIC
import LoginPages from "./components/LoginPages";
import RegistrationPage from "./components/RegistrationPage";
import ResetPasswordFinal from "./components/ResetPasswordFinal";
import UpdatePassword from "./components/UpdatePassword";
import ResetPasswordConfirm from "./components/ResetPasswordConfirm";

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
import MarketplaceUser from "./components/MarketplaceUser"; 
import MarketplaceGestion from "./components/MarketplaceGestion";
import MarketplaceAdmin from "./components/MarketplaceAdmin";

// TABELLONI PADEL
import PadelBracket from "./components/PadelBracket";
import TabelloneRipescaggi from "./components/TabelloneRipescaggi";
import TabelloneSemplice from './components/TabelloneSemplice';

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
  const { user, loading, role } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPages />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/reset-password" element={<ResetPasswordFinal />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          <Route path="/marketplace" element={<ProtectedRoute><MarketplaceList /></ProtectedRoute>} />
          <Route path="/marketplace/main" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/marketplace/user" element={<ProtectedRoute><MarketplaceUser /></ProtectedRoute>} />
          <Route path="/marketplace-admin" element={<MarketplaceAdmin />} />

          
          {/* ✅ FIX MarketplaceAdmin mancante */}
          <Route path="/marketplace-admin" element={<ProtectedRoute adminOnly><Marketplace /></ProtectedRoute>} />
          <Route path="/admin/marketplace" element={<ProtectedRoute adminOnly><Marketplace /></ProtectedRoute>} />
          <Route path="/admin/marketplace-gestion" element={<ProtectedRoute adminOnly><MarketplaceGestion /></ProtectedRoute>} />

          <Route path="/tournaments" element={<ProtectedRoute><TournamentList /></ProtectedRoute>} />
          <Route path="/eventi-tornei" element={<ProtectedRoute><EventiTornei /></ProtectedRoute>} />
          <Route path="/tournaments/:tournamentId" element={<ProtectedRoute><SingleTournament /></ProtectedRoute>} />
          <Route path="/eventi-tornei/:torneoId" element={<ProtectedRoute><SingleTournament /></ProtectedRoute>} />
          
          {/* SOLO PADELBRACKET ORIGINALE */}
          <Route path="/tabellone/:tournamentId" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />
          <Route path="/bracket/:id" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />
          <Route path="/tabellone-coppa" element={<ProtectedRoute><PadelBracket /></ProtectedRoute>} />
          
          <Route path="/ripescaggi/:tournamentId" element={<ProtectedRoute><TabelloneRipescaggi /></ProtectedRoute>} />

          <Route path="/admin-tournaments" element={<ProtectedRoute><TournamentAdminPanel /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><TournamentListAndAdmin /></ProtectedRoute>} />

          {/* TABELLONE CANVA - NUOVO */}
          <Route path="/stampa-tabellone" element={<ProtectedRoute><TabelloneSemplice /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
