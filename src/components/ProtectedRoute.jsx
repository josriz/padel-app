// src/components/ProtectedRoute.jsx - ✅ BYPASS TOTALE NO LAMPEGGIO
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  console.log('🔥 ProtectedRoute BYPASS TOTALE - SEMPRE OK!');
  
  // ✅ HARDCODE: SEMPRE PASSA per TUTTO!
  return children;
};

export default ProtectedRoute;
