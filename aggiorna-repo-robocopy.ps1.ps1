# --- CONFIGURAZIONE ---
$GDrivePath = "G:\Il mio Drive\padel-app"
$RepoPath   = "C:\Percorso\PadelAppGit"  # Repo Git locale
$Branch     = "main"

# --- 1️⃣ Copia file da GDrive al repo Git ---
Write-Host "Copiando file da GDrive al repo..."
robocopy $GDrivePath $RepoPath /MIR /XD ".git" "node_modules"

# --- 2️⃣ Entra nella cartella del repo Git ---
Set-Location $RepoPath

# --- 3️⃣ Rimuovi submodule temp-check se esiste ---
if (Test-Path "$RepoPath\temp-check") {
    Write-Host "Rimuovendo submodule temp-check..."
    git submodule deinit -f temp-check
    git rm -f temp-check
    if (Test-Path ".gitmodules") {
        (Get-Content .gitmodules) | Where-Object {$_ -notmatch "temp-check"} | Set-Content .gitmodules
    }
}

# --- 4️⃣ Aggiungi e committa tutte le modifiche ---
Write-Host "Aggiungendo e committando le modifiche..."
git add .
git commit -m "Aggiornamento repo con versione GDrive pronta per Netlify"

# --- 5️⃣ Push sul remote ---
Write-Host "Eseguendo push su Git remote..."
git push origin $Branch

Write-Host "✅ Operazione completata."
