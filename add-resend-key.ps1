# PowerShell script to add Resend API key to Vercel
# Usage: .\add-resend-key.ps1

Write-Host "Adding RESEND_API_KEY to Vercel..." -ForegroundColor Green

# Prompt for the API key
$apiKey = Read-Host "Please paste your Resend API key (starts with 're_')"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "Error: API key cannot be empty!" -ForegroundColor Red
    exit 1
}

# Link to Vercel project if not already linked
Write-Host "`nLinking to Vercel project..." -ForegroundColor Yellow
vercel link --yes

# Add the environment variable to Vercel
Write-Host "`nAdding environment variable to Vercel..." -ForegroundColor Yellow
vercel env add RESEND_API_KEY production

Write-Host "`n✅ Done! The RESEND_API_KEY has been added to your Vercel project." -ForegroundColor Green
Write-Host "You may need to redeploy your application for the changes to take effect." -ForegroundColor Yellow

