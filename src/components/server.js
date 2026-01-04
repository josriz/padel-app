import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// Configura Supabase con SERVICE_ROLE key
const supabase = createClient(
  process.env.SUPABASE_URL,            // esempio: https://xyzcompany.supabase.co
  process.env.SUPABASE_SERVICE_ROLE_KEY // la tua SERVICE_ROLE key dal progetto Supabase
);

// Endpoint per creare fornitore
app.post("/create-fornitore", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) return res.status(400).json({ error: "Email e nome richiesti" });

  try {
    // 1️⃣ Creazione utente
    const { data: userData, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password: "temporaryPassword123!", // password temporanea
      email_confirm: true
    });
    if (createUserError) throw createUserError;

    // 2️⃣ Salvataggio nel profilo
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userData.user.id, name, role: "fornitore" }]);
    if (profileError) throw profileError;

    // 3️⃣ Invio email per impostare password
    const { error: resetError } = await supabase.auth.admin.resetUserPassword(userData.user.id);
    if (resetError) throw resetError;

    res.json({ success: true, message: `Fornitore creato e email inviata a ${email}` });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Errore server" });
  }
});

// Avvio server
const PORT = process.env.PORT || 54321;
app.listen(PORT, () => console.log(`Server attivo sulla porta ${PORT}`));
