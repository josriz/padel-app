import React, { useState } from "react";

export default function CreateFornitore() {
  const [fornitoreNome, setFornitoreNome] = useState("");
  const [fornitoreCognome, setFornitoreCognome] = useState("");
  const [fornitoreEmail, setFornitoreEmail] = useState("");
  const [loadingFornitore, setLoadingFornitore] = useState(false);
  const [fornitoreMessage, setFornitoreMessage] = useState("");

  const handleCreateFornitore = async () => {
    if (!fornitoreNome || !fornitoreEmail) {
      return alert("Inserisci nome ed email del fornitore");
    }

    setLoadingFornitore(true);
    setFornitoreMessage("");

    try {
      const response = await fetch(
        "https://hfegsribygmumfdvujhh.supabase.co/functions/v1/create-fornitore",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: fornitoreNome,
            cognome: fornitoreCognome,
            email: fornitoreEmail,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Errore nella creazione del fornitore");
      }

      setFornitoreMessage(`Accesso fornitore creato: ${fornitoreEmail}`);
      setFornitoreNome("");
      setFornitoreCognome("");
      setFornitoreEmail("");
    } catch (err) {
      console.error(err);
      setFornitoreMessage(`Errore invio accesso: ${err.message}`);
    } finally {
      setLoadingFornitore(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-4 text-center">Crea Fornitore</h2>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4">
        <input
          placeholder="Nome"
          value={fornitoreNome}
          onChange={(e) => setFornitoreNome(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Cognome (opzionale)"
          value={fornitoreCognome}
          onChange={(e) => setFornitoreCognome(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={fornitoreEmail}
          onChange={(e) => setFornitoreEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleCreateFornitore}
          disabled={loadingFornitore}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loadingFornitore ? "Creazione..." : "Crea Fornitore"}
        </button>
        {fornitoreMessage && (
          <p className="mt-4 text-center font-medium">{fornitoreMessage}</p>
        )}
      </div>
    </div>
  );
}
