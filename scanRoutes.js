import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_PATH = path.join(__dirname, 'src', 'App.jsx');

fs.readFile(APP_PATH, 'utf8', (err, data) => {
  if (err) return console.error("Errore lettura App.jsx:", err);

  // Rimuoviamo ritorni a capo per semplificare parsing
  const content = data.replace(/\n/g, ' ');

  // Regex flessibile per trovare tutti i dashboard
  const routeRegex = /<Route\s+[^>]*path=["']([^"']+)["'][^>]*element={<\s*([a-zA-Z0-9]+Dashboard)\s*\/>}/g;

  const matches = [];
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    matches.push({
      path: match[1],
      component: match[2]
    });
  }

  if (matches.length === 0) {
    console.log("Nessuna dashboard trovata!");
  } else {
    console.log("Dashboard trovate:");
    matches.forEach(r => {
      console.log(`- ${r.component} => http://localhost:5173${r.path}`);
    });
  }
});
