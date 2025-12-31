import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function CreateFornitoreForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Creazione utente in auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: "temporaryPassword123!", // password temporanea
      email_confirm: true, // opzionale, invia email
    });

    if (error) {
      setMessage(`Errore: ${error.message}`);
      setLoading(false);
      return;
    }

    // 2. Salvo ruolo e nome nella tabella custom "profiles"
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: data.user.id, name, role: "fornitore" }]);

    if (profileError) {
      setMessage(`Errore profilo: ${profileError.message}`);
      setLoading(false);
      return;
    }

    // 3. Invio email al fornitore con link per impostare password
    const { error: mailError } = await supabase.auth.api.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/set-password`,
    });

    if (mailError) {
      setMessage(`Errore invio mail: ${mailError.message}`);
      setLoading(false);
      return;
    }

    setMessage("Fornitore creato! Email inviata per impostare la password.");
    setEmail("");
    setName("");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Crea Fornitore</h2>

      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="border p-2 w-full"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border p-2 w-full"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Creazione..." : "Crea Fornitore"}
      </button>

      {message && <div className="text-green-600">{message}</div>}
    </form>
  );
}
