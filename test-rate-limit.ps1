
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "     Rate Limiting Test Script                         " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$endpoint = "/api/products"
$fullUrl = "$baseUrl$endpoint"

Write-Host "Testing endpoint: $fullUrl" -ForegroundColor Yellow
Write-Host "Expected limit: 10 requests per minute (for POST /products)" -ForegroundColor Yellow
Write-Host ""

# Test 1: GET requests (Read Operations)
Write-Host "=== Test 1: GET Requests (Read Operations) ===" -ForegroundColor Green
Write-Host "Making 5 GET requests..." -ForegroundColor Gray

for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -ErrorAction Stop
        $limit = $response.Headers['X-RateLimit-Limit']
        $remaining = $response.Headers['X-RateLimit-Remaining']
        $reset = $response.Headers['X-RateLimit-Reset']
        
        Write-Host "Request $i`: " -NoNewline -ForegroundColor White
        Write-Host "Status=$($response.StatusCode) " -NoNewline -ForegroundColor Green
        Write-Host "Limit=$limit Remaining=$remaining" -ForegroundColor Cyan
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            $retryAfter = $_.Exception.Response.Headers['Retry-After']
            Write-Host "Request $i`: " -NoNewline -ForegroundColor White
            Write-Host "Status=429 (Rate Limited) " -NoNewline -ForegroundColor Red
            Write-Host "Retry-After=$retryAfter seconds" -ForegroundColor Yellow
        }
        else {
            Write-Host "Request $i`: Error - $statusCode" -ForegroundColor Red
        }
    }
    Start-Sleep -Milliseconds 100
}

Write-Host ""

# Test 2: Search endpoint
Write-Host "=== Test 2: Search Endpoint (100 requests/minute) ===" -ForegroundColor Green
Write-Host "Making 10 search requests..." -ForegroundColor Gray

$searchUrl = "$baseUrl/api/products/search?q=test"

for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $searchUrl -Method GET -ErrorAction Stop
        $limit = $response.Headers['X-RateLimit-Limit']
        $remaining = $response.Headers['X-RateLimit-Remaining']
        
        Write-Host "Search $i`: " -NoNewline -ForegroundColor White
        Write-Host "Status=$($response.StatusCode) " -NoNewline -ForegroundColor Green
        Write-Host "Limit=$limit Remaining=$remaining" -ForegroundColor Cyan
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            Write-Host "Search $i`: " -NoNewline -ForegroundColor White
            Write-Host "Status=429 (Rate Limited)" -ForegroundColor Red
        }
        else {
            Write-Host "Search $i`: Error - $statusCode" -ForegroundColor Red
        }
    }
    Start-Sleep -Milliseconds 100
}

Write-Host ""

# Test 3: Rapid requests to trigger rate limit
Write-Host "=== Test 3: Rapid Requests (Testing Rate Limit) ===" -ForegroundColor Green
Write-Host "Making 15 rapid GET requests to trigger global rate limit..." -ForegroundColor Gray
Write-Host "Note: Global limit is 500/15min, but we're testing the mechanism" -ForegroundColor Gray
Write-Host ""

$successCount = 0
$rateLimitedCount = 0

for ($i = 1; $i -le 15; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -ErrorAction Stop
        $successCount++
        $remaining = $response.Headers['X-RateLimit-Remaining']
        
        Write-Host "[OK] Request $i`: Success (Remaining: $remaining)" -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            $rateLimitedCount++
            Write-Host "[X] Request $i`: Rate Limited (429)" -ForegroundColor Red
        }
        else {
            Write-Host "[X] Request $i`: Error ($statusCode)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Milliseconds 50
}

Write-Host ""
Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  Successful: $successCount" -ForegroundColor Green
Write-Host "  Rate Limited: $rateLimitedCount" -ForegroundColor Red

Write-Host ""

# Test 4: Check rate limit headers
Write-Host "=== Test 4: Rate Limit Headers ===" -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri $fullUrl -Method GET -ErrorAction Stop
    
    Write-Host "Response Headers:" -ForegroundColor Cyan
    Write-Host "  X-RateLimit-Limit: $($response.Headers['X-RateLimit-Limit'])" -ForegroundColor White
    Write-Host "  X-RateLimit-Remaining: $($response.Headers['X-RateLimit-Remaining'])" -ForegroundColor White
    Write-Host "  X-RateLimit-Reset: $($response.Headers['X-RateLimit-Reset'])" -ForegroundColor White
}
catch {
    Write-Host "Could not retrieve headers" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "     Test Complete!                                     " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test POST rate limits (10 requests/minute):" -ForegroundColor Yellow
Write-Host "  Run this command 15 times quickly:" -ForegroundColor Gray
Write-Host '  Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -ContentType "application/json" -Body ''{"name":"Test"}''' -ForegroundColor Gray
Write-Host ""
Write-Host "To monitor rate limits in real-time:" -ForegroundColor Yellow
Write-Host "  Watch the server logs for rate limit messages" -ForegroundColor Gray
Write-Host ""

# Additional test: Test different endpoints
Write-Host "=== Additional Test: Different Endpoints ===" -ForegroundColor Green
Write-Host ""

$endpoints = @(
    @{Name="Products"; Url="/api/products"; Method="GET"},
    @{Name="Categories"; Url="/api/categories"; Method="GET"},
    @{Name="Orders"; Url="/api/orders"; Method="GET"},
    @{Name="Offers"; Url="/api/offers"; Method="GET"}
)

foreach ($ep in $endpoints) {
    try {
        $url = "$baseUrl$($ep.Url)"
        $response = Invoke-WebRequest -Uri $url -Method $ep.Method -ErrorAction Stop
        $limit = $response.Headers['X-RateLimit-Limit']
        $remaining = $response.Headers['X-RateLimit-Remaining']
        
        Write-Host "[OK] $($ep.Name): " -NoNewline -ForegroundColor White
        Write-Host "Limit=$limit Remaining=$remaining" -ForegroundColor Green
    }
    catch {
        Write-Host "[X] $($ep.Name): Error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Testing finished!" -ForegroundColor Green
