// src/components/SidebarMenu.jsx - ✅ if (!isOpen) return null
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function SidebarMenu({ isOpen, onClose, userType }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const logout = () => {
    onClose();
    navigate('/');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <aside className="fixed top-0 left-0 z-50 w-72 h-screen bg-white shadow-2xl border-r border-gray-200">
        {/* resto del codice sidebar */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎾</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Padel Club</h2>
              <p className="text-xs text-gray-500 capitalize">{userType}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-6 space-y-2 overflow-y-auto h-[calc(100vh-8rem)]">
          <Link to="/" className={`flex items-center p-4 rounded-xl w-full ${location.pathname === '/' ? 'bg-blue-100 text-blue-700 shadow-md border-2 border-blue-200' : 'text-gray-700 hover:bg-gray-50'}`} onClick={onClose}>🏠 Dashboard</Link>
          <Link to="/tournaments" className={`flex items-center p-4 rounded-xl w-full ${location.pathname.startsWith('/tournaments') ? 'bg-green-100 text-green-700 shadow-md border-2 border-green-200' : 'text-gray-700 hover:bg-gray-50'}`} onClick={onClose}>🏆 Tornei</Link>
          {userType === 'admin' && (
            <>
              <Link to="/admin" className={`flex items-center p-4 rounded-xl w-full ${location.pathname === '/admin' ? 'bg-purple-100 text-purple-700 shadow-md border-2 border-purple-200' : 'text-gray-700 hover:bg-gray-50'}`} onClick={onClose}>⚙️ Admin</Link>
              <Link to="/admin/list" className={`flex items-center p-4 rounded-xl w-full ${location.pathname === '/admin/list' ? 'bg-orange-100 text-orange-700 shadow-md border-2 border-orange-200' : 'text-gray-700 hover:bg-gray-50'}`} onClick={onClose}>📋 Lista Admin</Link>
            </>
          )}
          {userType !== 'guest' && <button onClick={logout} className="w-full flex items-center p-4 rounded-xl text-red-600 hover:bg-red-50 font-medium">🚪 Esci</button>}
        </nav>
      </aside>
    </>
  );
}
