# =========================
# Aggiornamento sicuro progetto Padel-App
# =========================

# Configurazioni
$projectPath = "C:\padel-app"
$backupPath = "C:\padel-app-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$tempClonePath = "C:\padel-app-temp"
$gitRepoUrl = "https://github.com/TUOUSERNAME/tuo-repo.git" # <-- sostituire con il repo corretto

# Creazione backup
Write-Host "Creazione backup in $backupPath..."
New-Item -ItemType Directory -Path $backupPath -Force
Copy-Item "$projectPath\.env" "$backupPath\" -Force -ErrorAction SilentlyContinue
Copy-Item "$projectPath\src\components" "$backupPath\components" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$projectPath\src\context" "$backupPath\context" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$projectPath\App.jsx" "$backupPath\" -Force -ErrorAction SilentlyContinue
Copy-Item "$projectPath\public" "$backupPath\public" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Backup completato."

# Clonazione temporanea repository Git
Write-Host "Clonazione repository in cartella temporanea..."
Remove-Item "$tempClonePath" -Recurse -Force -ErrorAction SilentlyContinue
git clone $gitRepoUrl $tempClonePath --depth 1
Write-Host "Clonazione completata."

# Sovrascrittura cartelle e file specifici
Write-Host "Aggiornamento cartelle e file..."
Copy-Item "$tempClonePath\src\components" "$projectPath\src\components" -Recurse -Force
Copy-Item "$tempClonePath\src\context" "$projectPath\src\context" -Recurse -Force
Copy-Item "$tempClonePath\App.jsx" "$projectPath\App.jsx" -Force
Copy-Item "$tempClonePath\public" "$projectPath\public" -Recurse -Force
Write-Host "Aggiornamento completato."

# Rimozione cartella temporanea
Remove-Item "$tempClonePath" -Recurse -Force -ErrorAction SilentlyContinue

# Ripristino file .env
if (Test-Path "$backupPath\.env") {
    Copy-Item "$backupPath\.env" "$projectPath\" -Force
    Write-Host ".env ripristinato."
}

# Installazione dipendenze
Write-Host "Installazione dipendenze npm..."
cd $projectPath
npm install

Write-Host "Aggiornamento sicuro completato! Esegui 'npm start' per avviare l'app."
