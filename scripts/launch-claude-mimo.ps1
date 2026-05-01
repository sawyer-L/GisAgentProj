param(
    [string]$ProjectRoot = "G:\DevProject\Agent_Proj\GisAgentProj",
    [string]$BaseUrl = "https://api.xiaomimimo.com/anthropic",
    [string]$Model = "mimo-v2.5-pro",
    [string]$AuthToken = "sk-ssyy1ay0xo5d8m9thcskoh67jy6mmwqar7bdqa5yhmozk8o9"
)

$sessionScript = @"
`$host.UI.RawUI.WindowTitle = 'Claude Code - MiMo Session'
Set-Location '$ProjectRoot'

# Clear inherited Anthropic vars in this terminal only so old global values do not interfere.
Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_DEFAULT_SONNET_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_DEFAULT_OPUS_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_DEFAULT_HAIKU_MODEL -ErrorAction SilentlyContinue

`$env:ANTHROPIC_AUTH_TOKEN = '$AuthToken'
`$env:ANTHROPIC_BASE_URL = '$BaseUrl'
`$env:ANTHROPIC_MODEL = '$Model'
`$env:ANTHROPIC_DEFAULT_SONNET_MODEL = '$Model'
`$env:ANTHROPIC_DEFAULT_OPUS_MODEL = '$Model'
`$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = '$Model'

Write-Host 'Claude Code configured for MiMo in this terminal session only.' -ForegroundColor Green
Write-Host ('cwd=' + (Get-Location).Path)
Write-Host ('ANTHROPIC_BASE_URL=' + `$env:ANTHROPIC_BASE_URL)
Write-Host ('ANTHROPIC_MODEL=' + `$env:ANTHROPIC_MODEL)
Write-Host ('ANTHROPIC_AUTH_TOKEN=' + `$env:ANTHROPIC_AUTH_TOKEN.Substring(0, 6) + '...' + `$env:ANTHROPIC_AUTH_TOKEN.Substring(`$env:ANTHROPIC_AUTH_TOKEN.Length - 4))
Write-Host ''
claude
"@

$encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($sessionScript))
Start-Process powershell.exe -WorkingDirectory $ProjectRoot -ArgumentList '-NoExit', '-EncodedCommand', $encoded
