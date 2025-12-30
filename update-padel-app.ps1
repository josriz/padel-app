# Configura qui il tuo repository
$repoUrl = "https://github.com/<USERNAME>/<REPO>/archive/refs/heads/main.zip"
$localTemp = "$env:TEMP\padel-app-temp.zip"
$localExtract = "$env:TEMP\padel-app-temp"

# Percorsi locali
$componentsPath = "C:\padel-app\src\components"
$appPath = "C:\padel-app\src\App.jsx"
$contextPath = "C:\padel-app\src\context"
$publicPath = "C:\padel-app\public"

# 1. Scarica il repository in zip
Invoke-WebRequest -Uri $repoUrl -OutFile $localTemp

# 2. Estrai il repository
Expand-Archive -LiteralPath $localTemp -DestinationPath $localExtract -Force

# Trova la cartella principale estratta (solitamente <REPO>-main)
$extractedRoot = Get-ChildItem -Path $localExtract | Where-Object {$_.PSIsContainer} | Select-Object -First 1

# 3. Sovrascrivi cartelle e file
Copy-Item -Path "$($extractedRoot.FullName)\src\components\*" -Destination $componentsPath -Recurse -Force
Copy-Item -Path "$($extractedRoot.FullName)\src\context\*" -Destination $contextPath -Recurse -Force
Copy-Item -Path "$($extractedRoot.FullName)\src\App.jsx" -Destination $appPath -Force
Copy-Item -Path "$($extractedRoot.FullName)\public\*" -Destination $publicPath -Recurse -Force

# 4. Pulizia temporanea
Remove-Item $localTemp -Force
Remove-Item $localExtract -Recurse -Force

Write-Host "✅ Aggiornamento completato!"
