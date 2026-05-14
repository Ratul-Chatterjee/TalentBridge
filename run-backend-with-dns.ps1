# This script sets Google's public DNS and runs the TalentBridge backend
# Run from the backend directory: .\run-backend-with-dns.ps1

# Set public DNS servers
$dnsServers = @('8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1')
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }

Write-Host "Setting DNS servers to: $dnsServers" -ForegroundColor Green

foreach ($adapter in $adapters) {
    Write-Host "Updating adapter: $($adapter.Name)"
    Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex `
        -ServerAddresses $dnsServers `
        -Validate:$false
}

Write-Host "DNS configuration updated. Starting TalentBridge backend..." -ForegroundColor Green

# Run the backend
& "..\.tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run

Write-Host "Backend stopped." -ForegroundColor Yellow
