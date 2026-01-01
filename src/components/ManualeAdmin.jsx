import React, { useState, useEffect } from "react";

export default function ManualeAdmin() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    // Recupera il manuale online (es. da Supabase o endpoint REST)
    fetch("https://tuo-server.com/api/manuale-admin")
      .then(res => res.json())
      .then(data => setContent(data.testoManuale))
      .catch(err => console.error("Errore caricamento manuale:", err));
  }, []);

  return (
    <>
      {/* Icona Campanellino */}
      <button 
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#3b82f6",
          color: "#fff",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          border: "none",
          cursor: "pointer",
          fontSize: "24px"
        }}
        onClick={() => setOpen(true)}
      >
        🔔
      </button>

      {/* Modal Manuale */}
      {open && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "#fff",
            width: "80%",
            maxHeight: "80%",
            overflowY: "auto",
            padding: "20px",
            borderRadius: "8px",
            position: "relative"
          }}>
            <button 
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                border: "none",
                background: "transparent",
                fontSize: "20px",
                cursor: "pointer"
              }}
            >✖</button>

            <div dangerouslySetInnerHTML={{__html: content}} />
          </div>
        </div>
      )}
    </>
  );
}
