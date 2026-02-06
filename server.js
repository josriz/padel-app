import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// --- Legge .env ---
dotenv.config();

// --- Configurazione Supabase ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- App Express ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Funzione per generare JWT ---
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

// --- Endpoint create-fornitore ---
app.post("/create-fornitore", async (req, res) => {
  try {
    const { email, nome, cognome, password } = req.body;
    if (!email || !nome || !cognome) {
      return res.status(400).json({ error: "Manca email, nome o cognome" });
    }

    const full_name = `${nome} ${cognome}`;
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : await bcrypt.hash("password123", 10); // default password

    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          email,
          nome,
          cognome,
          full_name,
          password: hashedPassword,
          role: "fornitore",
          is_admin: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Fornitore creato correttamente", data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- Endpoint check-fornitore ---
app.post("/check-fornitore", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Manca email" });

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") return res.status(400).json({ error: error.message });
    return res.status(200).json({ exists: !!data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- Endpoint login-fornitore ---
app.post("/login-fornitore", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Manca email o password" });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) return res.status(401).json({ error: "Utente non trovato" });

    const match = await bcrypt.compare(password, data.password);
    if (!match) return res.status(401).json({ error: "Password errata" });

    const token = generateToken(data);
    return res.status(200).json({ message: "Login effettuato", token, user: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- Avvio server ---
const PORT = 54321;
app.listen(PORT, () => {
  console.log(`Server locale in ascolto su http://127.0.0.1:${PORT}`);
});
