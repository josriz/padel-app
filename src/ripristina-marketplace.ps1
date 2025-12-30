# === CONFIG ===
$BRANCH = "main"

$FILES = @(
  "src/components/Marketplace.jsx",
  "src/components/Marketplace.css",
  "src/assets/marketplace"
)

Write-Host "🔄 Ripristino file Marketplace dal branch $BRANCH..." -ForegroundColor Cyan

git fetch origin

foreach ($file in $FILES) {
  Write-Host "➡️ Ripristino $file"
  git checkout origin/$BRANCH -- $file
}

Write-Host "✅ Marketplace ripristinato correttamente da Git" -ForegroundColor Green
