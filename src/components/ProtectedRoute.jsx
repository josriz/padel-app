// src/components/ProtectedRoute.jsx - SUPERADMIN + TUTTI (tranne fornitore limitato)
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const ProtectedRoute = ({ children, adminOnly = false, fornitoreOnly = false }) => {
  const { user, loading, role } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Caricamento...</div>;

  console.log('🔥 ProtectedRoute:', { user: user?.email, role, adminOnly, fornitoreOnly });

  // SUPERADMIN: vede TUTTO SEMPRE
  if (role === "superadmin") return children;

  // FORNITORE: solo dashboard-fornitore + set-password
  if (fornitoreOnly && role !== "fornitore") {
    return <Navigate to="/dashboard-fornitore" replace />;
  }

  // ADMIN: solo adminOnly routes
  if (adminOnly && role !== "admin" && role !== "superadmin") {
    return <div>Accesso negato - Solo Admin</div>;
  }

  // UTENTI: tutto tranne adminOnly
  if (!user) return <Navigate to="/" replace />;

  return children; // ✅ TUTTI VEDONO (tranne casi sopra)
};

export default ProtectedRoute;
