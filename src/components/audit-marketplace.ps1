# SALVA come audit-marketplace.ps1
Write-Host "🔍 AUDIT COMPLETO MARKETPLACE FILES" -ForegroundColor Magenta
Get-ChildItem -Path src/components -Recurse -Include *Marketplace*.jsx,*marketplace*.jsx,*DashboardUser*.jsx | ForEach-Object {
    Write-Host "`n📄 $($_.FullName)" -ForegroundColor Cyan
    Select-String -Path $_.FullName -Pattern "supabase|fetchProducts|addProduct|insert|marketplace_items" | ForEach-Object {
        Write-Host "  ✅ LINE $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Green
    }
}

Write-Host "`n🔍 SUPABASE CLIENT USAGE:" -ForegroundColor Yellow
Select-String -Path "src/*" -Pattern "supabaseClient|from\('marketplace" -CaseSensitive:$false | Select-Object Filename,LineNumber,Line
