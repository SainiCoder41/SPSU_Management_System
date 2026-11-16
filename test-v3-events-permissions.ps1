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

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "STARTING SPSU CMS RELEASE v3.0 (EVENTS & PERMISSIONS) TESTS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Login Accounts
$sLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"student1@spsu.ac.in","password":"Student@1234"}'
$sToken = $sLogin.token

$wLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"warden.bh2@spsu.ac.in","password":"Staff@1234"}'
$wToken = $wLogin.token

$pLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"parent1@gmail.com","password":"Parent@1234"}'
$pToken = $pLogin.token

$aLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@spsu.ac.in","password":"Admin@123"}'
$aToken = $aLogin.token

# 2. Events: Fetch & Target Audience (EVT-001, EVT-003)
$eventsList = $null
Test-Case "EVT-003: Browse Campus Events" {
    $res = Invoke-RestMethod -Uri "$baseUrl/events" -Method Get -Headers @{ Authorization = "Bearer $sToken" }
    if ($res.count -lt 3) { throw "Expected at least 3 campus events" }
    $global:eventsList = $res.data
}

# 3. Events: Create New Event (EVT-001, EVT-002)
$createdEventId = $null
Test-Case "EVT-001/EVT-002: Admin/Faculty Publishes New Event" {
    $body = @{
        title = "SPSU Robotics & Drone Workshop 2026"
        description = "Hands-on drone assembly, flight telemetry, and computer vision guidance."
        category = "Workshop"
        dateTime = (Get-Date).AddDays(10).ToString("yyyy-MM-ddTHH:mm:ss")
        endDateTime = (Get-Date).AddDays(10).AddHours(6).ToString("yyyy-MM-ddTHH:mm:ss")
        venue = "Mechatronics & Robotics Lab, Tech Block"
        capacity = 40
        isRegistrationOpen = $true
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/events" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $aToken" } -Body $body
    if ($res.data.capacity -ne 40) { throw "Capacity mismatch" }
    $global:createdEventId = $res.data._id
}

# 4. Events: Student RSVP & Capacity Limit (EVT-004, EVT-005)
Test-Case "EVT-004/EVT-005: Student RSVPs for Event & Counter Increments" {
    $res = Invoke-RestMethod -Uri "$baseUrl/events/$($global:createdEventId)/rsvp" -Method Post -Headers @{ Authorization = "Bearer $sToken" }
    if ($res.data.registeredCount -ne 1) { throw "Registered count not incremented" }
}

# 5. Events: Withdraw RSVP (EVT-004)
Test-Case "EVT-004: Student Withdraws RSVP Registration" {
    $res = Invoke-RestMethod -Uri "$baseUrl/events/$($global:createdEventId)/withdraw" -Method Post -Headers @{ Authorization = "Bearer $sToken" }
    if ($res.data.registeredCount -ne 0) { throw "Registered count not decremented" }
}

# 6. Events: Participant List Export (EVT-006)
Test-Case "EVT-006: Organizer Exports Event Participant Roster (.xlsx)" {
    $hackathon = $global:eventsList | Where-Object { $_.title -match "Hackathon" }
    $res = Invoke-WebRequest -Uri "$baseUrl/events/$($hackathon._id)/export" -Method Get -Headers @{ Authorization = "Bearer $aToken" } -UseBasicParsing
    if ($res.StatusCode -ne 200) { throw "Export failed" }
    if ($res.RawContentLength -lt 500) { throw "Spreadsheet size too small" }
}

# 7. Permissions: Fetch Outing Types (PER-001)
$permTypes = $null
Test-Case "PER-001: Fetch Permission & Gate Pass Categories" {
    $res = Invoke-RestMethod -Uri "$baseUrl/permissions/types" -Method Get -Headers @{ Authorization = "Bearer $sToken" }
    if ($res.count -lt 4) { throw "Expected at least 4 permission types" }
    $global:permTypes = $res.data
}

# 8. Permissions: Submit Outing Pass with Multi-Party Requirement (PER-001, PER-003)
$createdPermId = $null
Test-Case "PER-001/PER-003: Student Requests Overnight Outing Pass" {
    $nightPass = $global:permTypes | Where-Object { $_.code -eq "NIGHT_OUTING" }
    $start = (Get-Date).AddDays(5).ToString("yyyy-MM-ddTHH:mm:ss")
    $end = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")

    $body = @{
        permissionTypeId = $nightPass._id
        startDateTime = $start
        endDateTime = $end
        destination = "Home residence, Shobhagpura, Udaipur"
        reason = "Automated test weekend visit"
        emergencyContact = "+91 94140 12345"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/permissions" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $sToken" } -Body $body
    if ($res.data.status -ne "Pending") { throw "Status should be Pending" }
    if ($res.data.wardenSignOff.status -ne "Pending") { throw "Warden sign-off should be Pending" }
    if ($res.data.parentSignOff.status -ne "Pending") { throw "Parent sign-off should be Pending" }
    $global:createdPermId = $res.data._id
}

# 9. Conflict Checking: Overlap with Approved Leave (PER-005, BR-005)
Test-Case "PER-005/BR-005: Automatic Flagging of Overlap with Approved Leave" {
    # Earlier in seed, student1 has an Approved Leave spanning (today - 10 days) to (today - 9 days)
    # Let's request a pass covering that exact approved leave period to test conflict detection
    $dayPass = $global:permTypes | Where-Object { $_.code -eq "DAY_OUTING" }
    $conflictStart = (Get-Date).AddDays(-10).ToString("yyyy-MM-ddTHH:mm:ss")
    $conflictEnd = (Get-Date).AddDays(-9).ToString("yyyy-MM-ddTHH:mm:ss")

    $body = @{
        permissionTypeId = $dayPass._id
        startDateTime = $conflictStart
        endDateTime = $conflictEnd
        destination = "City Center"
        reason = "Test leave conflict flagging"
        emergencyContact = "+91 94140 12345"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/permissions" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $sToken" } -Body $body
    if ($res.data.hasLeaveConflict -ne $true) { throw "Permission did not flag conflict with approved leave" }
    if ($res.data.leaveConflictDetails -notmatch "Conflict") { throw "Conflict details missing" }
}

# 10. Warden Queue & Review (PER-003, PER-006)
Test-Case "PER-003/PER-006: Hostel Warden Reviews & Approves Outing Request" {
    $queue = Invoke-RestMethod -Uri "$baseUrl/permissions/warden-queue" -Method Get -Headers @{ Authorization = "Bearer $wToken" }
    $found = $queue.data | Where-Object { $_._id -eq $global:createdPermId }
    if (-not $found) { throw "Permission not found in warden queue" }

    $reviewBody = @{
        action = "Approved"
        comments = "Warden approved. Return strictly before Monday 8:00 AM."
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/permissions/$($global:createdPermId)/warden-review" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $wToken" } -Body $reviewBody
    if ($res.data.wardenSignOff.status -ne "Approved") { throw "Warden sign-off not marked Approved" }
    # Because parent sign-off is still pending, overall status must remain Pending (PER-003)
    if ($res.data.status -ne "Pending") { throw "Overall status should be Pending awaiting parent sign-off" }
}

# 11. Parent Queue & Sign-Off (PER-003)
Test-Case "PER-003: Parent Signs Off Overnight Stay -> Final Status Becomes Approved" {
    $parentQueue = Invoke-RestMethod -Uri "$baseUrl/permissions/parent-queue" -Method Get -Headers @{ Authorization = "Bearer $pToken" }
    $found = $parentQueue.data | Where-Object { $_._id -eq $global:createdPermId }
    if (-not $found) { throw "Permission not found in parent queue" }

    $signOffBody = @{
        action = "Approved"
        comments = "Parent confirmed Aarav will be staying at home."
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/permissions/$($global:createdPermId)/parent-signoff" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $pToken" } -Body $signOffBody
    if ($res.data.parentSignOff.status -ne "Approved") { throw "Parent sign-off not marked Approved" }
    # Now that BOTH Warden and Parent have approved, overall status must be Approved!
    if ($res.data.status -ne "Approved") { throw "Overall status did not transition to Approved after all sign-offs completed" }
}

$summaryColor = "Green"
if ($failed -gt 0) { $summaryColor = "Red" }
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY (v3.0 EVENTS & PERMISSIONS): $passed PASSED, $failed FAILED" -ForegroundColor $summaryColor
Write-Host "============================================================" -ForegroundColor Cyan

if ($failed -gt 0) { exit 1 } else { exit 0 }
