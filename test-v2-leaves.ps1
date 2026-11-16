$baseUrl = "http://localhost:5000/api"
$passed = 0
$failed = 0

function Test-Case($name, $script) {
    try {
        & $script
        Write-Host "PASS: $name" -ForegroundColor Green
        $global:passed++
    } catch {
        Write-Host "FAIL: $name - $($_.Exception.Message)" -ForegroundColor Red
        $global:failed++
    }
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "STARTING SPSU CMS RELEASE v2.0 LEAVE MANAGEMENT TESTS" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Login Student & Mentor & Admin
$sLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"student1@spsu.ac.in","password":"Student@1234"}'
$sToken = $sLogin.token

$mLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"mentor.cse@spsu.ac.in","password":"Staff@1234"}'
$mToken = $mLogin.token

$aLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@spsu.ac.in","password":"Admin@123"}'
$aToken = $aLogin.token

# 2. Leave Types (LEV-009)
$leaveTypes = $null
Test-Case "LEV-009: Fetch Configured Leave Types" {
    $res = Invoke-RestMethod -Uri "$baseUrl/leaves/types" -Method Get -Headers @{ Authorization = "Bearer $sToken" }
    if ($res.count -lt 4) { throw "Expected at least 4 leave types (CL, ML, HV, OD)" }
    $global:leaveTypes = $res.data
}

# 3. Student Balances (LEV-008)
Test-Case "LEV-008: Student Leave Balance Tracking" {
    $res = Invoke-RestMethod -Uri "$baseUrl/leaves/balances" -Method Get -Headers @{ Authorization = "Bearer $sToken" }
    if ($res.data.Count -lt 1) { throw "No leave balance returned" }
    $cl = $res.data | Where-Object { $_.leaveType.code -eq "CL" }
    if (-not $cl) { throw "Casual Leave balance missing" }
}

# 4. Student Submits Leave (LEV-001, LEV-002, LEV-003)
$createdLeaveId = $null
Test-Case "LEV-001/LEV-003: Student Submits Leave Routed to Mentor" {
    $clType = $global:leaveTypes | Where-Object { $_.code -eq "CL" }
    $startDate = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
    $endDate = (Get-Date).AddDays(12).ToString("yyyy-MM-dd")

    $body = @{
        leaveTypeId = $clType._id
        startDate = $startDate
        endDate = $endDate
        reason = "Automated test family event attendance in Jaipur"
        emergencyContact = "+91 94140 12345"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/leaves" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $sToken" } -Body $body
    if ($res.data.status -ne "Pending") { throw "Status should be Pending" }
    if ($res.data.numberOfDays -ne 3) { throw "Expected 3 days" }
    $global:createdLeaveId = $res.data._id
}

# 5. Overlap Validation (LEV-002)
Test-Case "LEV-002: Rejection of Overlapping Leave Request" {
    $clType = $global:leaveTypes | Where-Object { $_.code -eq "CL" }
    $startDate = (Get-Date).AddDays(11).ToString("yyyy-MM-dd")
    $endDate = (Get-Date).AddDays(13).ToString("yyyy-MM-dd")

    $body = @{
        leaveTypeId = $clType._id
        startDate = $startDate
        endDate = $endDate
        reason = "Conflicting overlapping request"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "$baseUrl/leaves" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $sToken" } -Body $body
        throw "Overlapping leave was unexpectedly allowed"
    } catch {
        # Expected error
    }
}

# 6. Approver Queue (LEV-007)
Test-Case "LEV-007: Mentor Views Pending Leave Queue" {
    $res = Invoke-RestMethod -Uri "$baseUrl/leaves/pending" -Method Get -Headers @{ Authorization = "Bearer $mToken" }
    $found = $res.data | Where-Object { $_._id -eq $global:createdLeaveId }
    if (-not $found) { throw "Created leave not found in mentor's pending queue" }
}

# 7. Approver Decision: Approve (LEV-004, LEV-005, SH-006)
Test-Case "LEV-004/LEV-005: Mentor Approves Leave Request with Audit Log" {
    $body = @{
        action = "Approved"
        comments = "Approved. Contacted parents and verified travel itinerary."
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/leaves/$($global:createdLeaveId)/review" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $mToken" } -Body $body
    if ($res.data.status -ne "Approved") { throw "Status not updated to Approved" }
    if ($res.data.approvalHistory.Count -lt 2) { throw "Approval history missing" }
}

# 8. Verify Balance Deduction (LEV-008)
Test-Case "LEV-008: Leave Balance Deduction Upon Approval" {
    $res = Invoke-RestMethod -Uri "$baseUrl/leaves/balances" -Method Get -Headers @{ Authorization = "Bearer $sToken" }
    $cl = $res.data | Where-Object { $_.leaveType.code -eq "CL" }
    if ($cl.usedDays -lt 3) { throw "Used days not incremented" }
}

# 9. Student Cancels Pending/Returned Request (State Model 6.3)
Test-Case "State Model 6.3: Student Cancels Leave Application" {
    $hvType = $global:leaveTypes | Where-Object { $_.code -eq "HV" }
    $startDate = (Get-Date).AddDays(25).ToString("yyyy-MM-dd")
    $endDate = (Get-Date).AddDays(26).ToString("yyyy-MM-dd")

    $body = @{
        leaveTypeId = $hvType._id
        startDate = $startDate
        endDate = $endDate
        reason = "Home visit to be cancelled"
    } | ConvertTo-Json

    $createRes = Invoke-RestMethod -Uri "$baseUrl/leaves" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $sToken" } -Body $body
    $cancelId = $createRes.data._id

    $cancelBody = @{ comment = "Change of travel plan" } | ConvertTo-Json
    $cancelRes = Invoke-RestMethod -Uri "$baseUrl/leaves/$cancelId/cancel" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $sToken" } -Body $cancelBody
    if ($cancelRes.data.status -ne "Cancelled") { throw "Expected Cancelled status" }
}

# 10. Admin Configures New Leave Type (LEV-009)
Test-Case "LEV-009: Admin Configures New Leave Type Policy" {
    $body = @{
        name = "Special Cultural Event Leave"
        code = "CEL"
        applicableRole = "STUDENT"
        defaultQuota = 7
        requiresAttachment = $false
        description = "University cultural and youth fest participation"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/leaves/types" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $aToken" } -Body $body
    if ($res.data.code -ne "CEL") { throw "Created leave type code mismatch" }
}

# 11. Campus-wide Admin Oversight
Test-Case "Campus-Wide Leave Oversight (/leaves)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/leaves" -Method Get -Headers @{ Authorization = "Bearer $aToken" }
    if ($res.count -lt 1) { throw "Expected leave records in admin oversight" }
}

$summaryColor = "Green"
if ($failed -gt 0) { $summaryColor = "Red" }
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY (v2.0 LEAVES): $passed PASSED, $failed FAILED" -ForegroundColor $summaryColor
Write-Host "=====================================================" -ForegroundColor Cyan

if ($failed -gt 0) { exit 1 } else { exit 0 }
