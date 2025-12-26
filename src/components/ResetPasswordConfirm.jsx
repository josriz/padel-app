// src/components/ResetPasswordConfirm.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ResetPasswordConfirm = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-200 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Password Reimpostata</h2>
        <p className="mb-6">La tua password è stata modificata con successo! Ora puoi effettuare il login.</p>
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition"
        >
          Torna al Login
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
