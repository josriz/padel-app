// src/components/TournamentLayout.jsx - STILE LOGIN IDENTICO
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TournamentLayout = ({ children, title, subtitle, backLink="/tournaments" }) => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 py-12">
    <div className="w-full max-w-4xl">
      {/* BACK BUTTON - TESTO DINAMICO */}
      <Link 
        to={backLink}
        className="inline-flex items-center gap-2 text-blue-600 hover:underline font-semibold mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        {backLink === '/admin-tournaments' ? 'Tornei Admin' : 'Tornei Disponibili'}
      </Link>

      {/* TITOLI IDENTICI LOGIN */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      {/* CONTENT */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        {children}
      </div>
    </div>
  </div>
);

export default TournamentLayout;
