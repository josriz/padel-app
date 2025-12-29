# 🔥 SCRIPT FIX IMMAGINI - 100% COMPATIBILE
Write-Host "🔧 AVVIO FIX IMMAGINI..." -ForegroundColor Green

# 1. ELIMINA BACKUP
Write-Host "🗑️ Backup..." -ForegroundColor Yellow
Remove-Item "public\images\backup_*" -Force -ErrorAction SilentlyContinue

# 2. RINOMINA MAIUSCOLE
Write-Host "🔤 Nomi..." -ForegroundColor Yellow
if (Test-Path "public\images\Sfondo-Marketplace.jpg") { Rename-Item "public\images\Sfondo-Marketplace.jpg" "public\images\sfondo-marketplace.jpg" }
if (Test-Path "public\images\Raniero.jpeg") { Rename-Item "public\images\Raniero.jpeg" "public\images\raniero.jpg" }

# 3. SIMPLE SOSTITUZIONI (no regex complesse)
Write-Host "✏️ Percorsi..." -ForegroundColor Yellow
$files = Get-ChildItem -Recurse -Include "*.jsx","*.js","*.css"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Sostituzioni SICURE
    $content = $content -replace "./images/", "/images/"
    $content = $content -replace "../images/", "/images/"
    $content = $content -replace "Sfondo-Marketplace.jpg", "sfondo-marketplace.jpg"
    
    Set-Content $file.FullName $content
    Write-Host "  ✅ $($file.Name)"
}

Write-Host "`n📁 VERIFICA:" -ForegroundColor Cyan
Get-ChildItem "public\images\" | Sort-Object Length -Descending | Select-Object -First 5 Name, @{Name="KB";Expression={[math]::Round($_.Length/1KB,0)}} | Format-Table

Write-Host "`n🚀 npm run dev → Foto OK!" -ForegroundColor Green
