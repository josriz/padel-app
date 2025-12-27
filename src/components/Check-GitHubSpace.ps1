# Salva come Check-GitHubSpace.ps1
gh repo list josriz --limit 100 --json name,diskUsage | 
ConvertFrom-Json | 
Select-Object name, @{Name="SizeMB";Expression={[math]::Round($_.diskUsage/1024/1024,2)}} | 
Format-Table -AutoSize
