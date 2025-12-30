// fetchMarketplaceFiles.js
// Node.js script per scaricare i file Marketplace da GitHub

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// Configura qui il tuo repo e i file da prendere
const repoBaseUrl = "https://raw.githubusercontent.com/josriz/padel-app/main/src/components/";
const files = [
  "Marketplace.jsx",
  "MarketplaceList.jsx",
  "MarketplaceUser.jsx",
  "MarketplaceGestion.jsx",
  "MarketplaceAdmin.jsx",
  "Marketplace.css"
];

// Eventuali immagini statiche in public/images/
const imagesBaseUrl = "https://raw.githubusercontent.com/<USERNAME>/<REPO>/main/public/images/";
const images = [
  "bg-marketplace.jpg",
  "director-marketplace.png"
];

// Cartella di destinazione locale
const destFolder = "./src/components/MarketplaceFiles";
const destImages = "./public/images";

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Errore download: ${url}`);
  const fileStream = fs.createWriteStream(dest);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
  console.log(`✅ Scaricato: ${dest}`);
}

async function main() {
  // Crea cartelle se non esistono
  if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
  if (!fs.existsSync(destImages)) fs.mkdirSync(destImages, { recursive: true });

  // Scarica JSX e CSS
  for (const file of files) {
    const url = repoBaseUrl + file;
    const dest = path.join(destFolder, file);
    await downloadFile(url, dest);
  }

  // Scarica immagini
  for (const img of images) {
    const url = imagesBaseUrl + img;
    const dest = path.join(destImages, img);
    await downloadFile(url, dest);
  }

  console.log("✅ Tutti i file Marketplace sono stati copiati in locale!");
}

main().catch(err => console.error(err));
