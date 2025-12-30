# Esegui: .\fix-marketplace.ps1
Write-Host "🔍 1. Verifica differenze con Git deployed..." -ForegroundColor Green
git fetch origin
git diff origin/main -- src/pages/ src/components/Dashboard/ src/features/marketplace/ 2>/dev/null

Write-Host "🔍 2. Differenze specifiche Marketplace..." -ForegroundColor Green
git diff origin/main -- "*/Marketplace*" "*dashboard*" "*user-marketplace*" 2>/dev/null

Write-Host "🔍 3. File UI modificati..." -ForegroundColor Green
git diff --name-only origin/main | Select-String -Pattern "\.(css|scss|tsx|jsx|tailwind|style)"

Write-Host "✅ 4. Status repository..." -ForegroundColor Green
git status --short
