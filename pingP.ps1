$target = "142.250.154.101"
Add-Type -AssemblyName System.Windows.Forms

Write-Output "attente du retour d'outlook..."
$response = $false
while (!$response) {
    $client = New-Object System.Net.Sockets.TcpClient($target, 443)
    $dataStream = $client.GetStream()
    if ($dataStream.DataAvailable) {
        Write-Output $dataStream -or "0 data"
        $response = $true
    }
    else {
        Write-Output "essai supplementaire"
        Start-Sleep -Seconds 5
    }
}

[System.Windows.Forms.MessageBox]::Show(
    "Outlook est de retour !",
    "PWPusher",
    [System.Windows.Forms.MessageBoxButtons]::OK,
    [System.Windows.Forms.MessageBoxIcon]::Information
) | Out-Null