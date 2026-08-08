$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Server started at http://localhost:8080/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        $filePath = Join-Path "d:\Nihar\Website" $urlPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $fileInfo = New-Object System.IO.FileInfo($filePath)
            $totalLength = $fileInfo.Length
            
            # MIME Content Types
            if ($filePath.EndsWith(".html")) { $response.ContentType = "text/html" }
            elseif ($filePath.EndsWith(".css")) { $response.ContentType = "text/css" }
            elseif ($filePath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
            elseif ($filePath.EndsWith(".jpg") -or $filePath.EndsWith(".jpeg")) { $response.ContentType = "image/jpeg" }
            elseif ($filePath.EndsWith(".png")) { $response.ContentType = "image/png" }
            elseif ($filePath.EndsWith(".mp4")) { $response.ContentType = "video/mp4" }
            
            $response.Headers.Add("Accept-Ranges", "bytes")
            
            # Handle HTTP Range requests (crucial for Chrome HTML5 video streaming)
            $rangeHeader = $request.Headers["Range"]
            if ($rangeHeader -and $rangeHeader.StartsWith("bytes=")) {
                $range = $rangeHeader.Substring(6).Split('-')
                $start = [long]$range[0]
                $end = $totalLength - 1
                if ($range.Length -gt 1 -and !([string]::IsNullOrWhiteSpace($range[1]))) {
                    $end = [long]$range[1]
                }
                
                if ($start -ge $totalLength) {
                    $response.StatusCode = 416
                    $response.OutputStream.Close()
                    continue
                }
                
                $length = $end - $start + 1
                $response.StatusCode = 206
                $response.ContentLength64 = $length
                $response.Headers.Add("Content-Range", "bytes $start-$end/$totalLength")
                
                $fs = [System.IO.File]::OpenRead($filePath)
                $fs.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
                
                $buffer = New-Object byte[] (65536)
                $bytesRemaining = $length
                while ($bytesRemaining -gt 0) {
                    $bytesToRead = [Math]::Min($buffer.Length, $bytesRemaining)
                    $bytesRead = $fs.Read($buffer, 0, $bytesToRead)
                    if ($bytesRead -eq 0) { break }
                    $response.OutputStream.Write($buffer, 0, $bytesRead)
                    $bytesRemaining -= $bytesRead
                }
                $fs.Close()
            } else {
                $response.StatusCode = 200
                $response.ContentLength64 = $totalLength
                $fs = [System.IO.File]::OpenRead($filePath)
                $fs.CopyTo($response.OutputStream)
                $fs.Close()
            }
        } else {
            $response.StatusCode = 404
        }
        $response.OutputStream.Close()
    } catch {
        # Continue on exception
    }
}
