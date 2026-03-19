$port = if ($env:PORT) { [int]$env:PORT } else { 7777 }
$root = 'C:\Users\Stephi\webside waldmomente'

$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css'
  '.js'   = 'application/javascript'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.png'  = 'image/png'
  '.gif'  = 'image/gif'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "Server running on http://localhost:$port/"
[Console]::Out.Flush()

while ($true) {
  try {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = [System.IO.StreamReader]::new($stream)
    $writer = [System.IO.StreamWriter]::new($stream)
    $writer.AutoFlush = $true

    $requestLine = $reader.ReadLine()
    # drain headers
    while ($true) {
      $line = $reader.ReadLine()
      if ([string]::IsNullOrEmpty($line)) { break }
    }

    $method, $path, $proto = $requestLine -split ' ', 3
    if ($path -eq '/' -or [string]::IsNullOrEmpty($path)) { $path = '/index.html' }
    $path = $path -replace '\?.*$', ''
    $filePath = $root + ($path -replace '/', '\')

    if (Test-Path $filePath -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $ct = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
      $writer.WriteLine("HTTP/1.1 200 OK")
      $writer.WriteLine("Content-Type: $ct")
      $writer.WriteLine("Content-Length: $($bytes.Length)")
      $writer.WriteLine("Connection: close")
      $writer.WriteLine("")
      $stream.Write($bytes, 0, $bytes.Length)
    } else {
      $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $writer.WriteLine("HTTP/1.1 404 Not Found")
      $writer.WriteLine("Content-Length: $($body.Length)")
      $writer.WriteLine("Connection: close")
      $writer.WriteLine("")
      $stream.Write($body, 0, $body.Length)
    }

    $stream.Flush()
    $client.Close()
  } catch { }
}
