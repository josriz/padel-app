import React, { useEffect, useState } from "react";

const COMMISSION_PERCENTAGE = 20; // viene dall'admin (mock, poi da backend)

export default function VendorProductForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vendorPrice, setVendorPrice] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);

  // Calcolo automatico prezzo finale (SOLO VISIVO)
  useEffect(() => {
    const price = parseFloat(vendorPrice);
    if (!isNaN(price)) {
      const calculated =
        price + (price * COMMISSION_PERCENTAGE) / 100;
      setFinalPrice(calculated.toFixed(2));
    } else {
      setFinalPrice(0);
    }
  }, [vendorPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !vendorPrice) {
      alert("Compila tutti i campi obbligatori");
      return;
    }

    // DATI CHE VERRANNO SALVATI (il backend ricalcola!)
    const payload = {
      title,
      description,
      vendor_price: parseFloat(vendorPrice),
      commission_percentage: COMMISSION_PERCENTAGE,
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        background: "#fff",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        Inserisci nuovo articolo
      </h2>

      {/* TITOLO */}
      <label>Nome articolo *</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={inputStyle}
      />

      {/* DESCRIZIONE */}
      <label>Descrizione</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        style={inputStyle}
      />

      {/* PREZZO FORNITORE */}
      <label>Prezzo fornitore (€) *</label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={vendorPrice}
        onChange={(e) => setVendorPrice(e.target.value)}
        required
        style={inputStyle}
      />

      {/* COMMISSIONE (BLOCCATA) */}
      <label>Commissione piattaforma</label>
      <input
        type="text"
        value={`${COMMISSION_PERCENTAGE}%`}
        disabled
        style={{ ...inputStyle, background: "#f3f3f3" }}
      />

      {/* PREZZO FINALE (SOLO VISUALIZZAZIONE) */}
      <label>Prezzo finale visibile all’acquirente</label>
      <input
        type="text"
        value={`€ ${finalPrice}`}
        disabled
        style={{
          ...inputStyle,
          background: "#eef6ff",
          fontWeight: "bold",
        }}
      />

      <button
        type="submit"
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "#2563eb",
          color: "#fff",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Salva articolo
      </button>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "14px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};
