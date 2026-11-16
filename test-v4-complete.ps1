# SPSU Campus Management System - v4.0 & v3.5 Integration Test Suite
# Tests: Grievance/Complaint Ticketing & Redressal, Urgent/Pinned Notice Board, Unified In-App Notifications

$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:5000/api"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🏛️  SPSU Campus Management System - v4.0 & v3.5 E2E Tests" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Run-Step($name, $scriptBlock) {
    Write-Host ""
    Write-Host "🔹 Running: $name" -ForegroundColor Yellow
    try {
        & $scriptBlock
        Write-Host "  ✅ PASS: $name" -ForegroundColor Green
        $global:passed++
    } catch {
        Write-Host "  ❌ FAIL: $name - $_" -ForegroundColor Red
        $global:failed++
    }
}

# 1. Login Helper
function Get-Token($email, $password) {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
    return $res.token
}

$adminToken = Get-Token "admin@spsu.ac.in" "Admin@123"
$studentToken = Get-Token "student1@spsu.ac.in" "Student@1234"
$wardenToken = Get-Token "warden.bh2@spsu.ac.in" "Staff@1234"

# Global test ticket holders
$ticketId = $null
$sensitiveTicketId = $null
$noticeId = $null

# TEST 1: Submit standard grievance ticket (CMP-001, CMP-002, CMP-004)
Run-Step "1. Student Submits Standard Grievance Ticket" {
    $body = @{
        category = "Hostel"
        title = "Room heater circuit breaker tripping in BH-2 Block B"
        description = "Circuit breaker trips immediately whenever the room heater is turned on in Room 204."
        isAnonymous = $false
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $studentToken" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/complaints" -Method Post -Headers $headers -Body $body -ContentType "application/json" -UseBasicParsing
    
    if (-not $res.success -or -not $res.data.ticketNumber) {
        throw "Failed to submit complaint or missing ticketNumber"
    }
    if ($res.data.status -ne "Submitted") {
        throw "Expected status 'Submitted', got $($res.data.status)"
    }
    $global:ticketId = $res.data._id
    Write-Host "    -> Registered Ticket Number: $($res.data.ticketNumber) (ID: $global:ticketId)" -ForegroundColor DarkCyan
}

# TEST 2: Submit anonymous sensitive grievance (CMP-003, CMP-005, BR-008)
Run-Step "2. Student Submits Anonymous Sensitive Grievance (Ragging / Harassment)" {
    $body = @{
        category = "Ragging / Harassment"
        title = "Verbal confrontation by senior hostel residents"
        description = "Observed aggressive verbal harassment of junior students outside dining hall."
        isAnonymous = $true
    } | ConvertTo-Json

    $headers = @{ Authorization = "Bearer $studentToken" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/complaints" -Method Post -Headers $headers -Body $body -ContentType "application/json" -UseBasicParsing

    if (-not $res.data.isSensitive) {
        throw "Expected isSensitive to be true for Ragging / Harassment"
    }
    if ($res.data.priority -ne "Critical") {
        throw "Expected priority 'Critical', got $($res.data.priority)"
    }
    if (-not $res.data.isAnonymous) {
        throw "Expected isAnonymous to be true"
    }
    $global:sensitiveTicketId = $res.data._id
    Write-Host "    -> Registered Sensitive Ticket: $($res.data.ticketNumber) (Critical Priority)" -ForegroundColor DarkCyan
}

# TEST 3: Warden Queue Access Restriction on Sensitive Grievances (BR-008)
Run-Step "3. Verify Non-Admin (Warden) Queue Excludes Sensitive Grievance" {
    $headers = @{ Authorization = "Bearer $wardenToken" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/complaints/queue" -Method Get -Headers $headers -UseBasicParsing

    $foundSensitive = $res.data | Where-Object { $_._id -eq $global:sensitiveTicketId }
    if ($foundSensitive) {
        throw "Security Violation: Non-Admin warden was able to view sensitive grievance!"
    }
}

# TEST 4: Designated Authority (Admin) Can Access Sensitive Grievance with Identity Masked (CMP-003)
Run-Step "4. Admin Queue Access and Submitter Anonymity Masking" {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/complaints/queue?sensitiveOnly=true" -Method Get -Headers $headers -UseBasicParsing

    $target = $res.data | Where-Object { $_._id -eq $global:sensitiveTicketId }
    if (-not $target) {
        throw "Admin could not locate sensitive grievance in queue"
    }
    if ($target.complainant.name -ne "Anonymous Submitter") {
        throw "Anonymity breach: expected 'Anonymous Submitter', got '$($target.complainant.name)'"
    }
    Write-Host "    -> Confirmed submitter name masked as '$($target.complainant.name)'" -ForegroundColor DarkCyan
}

# TEST 5: Status Update to Under Review and Add Internal Note (CMP-006, CMP-007)
Run-Step "5. Update Status to 'Under Review' and Add Internal Note" {
    $headers = @{ Authorization = "Bearer $wardenToken" }
    
    # 5a. Update status
    $statusBody = @{
        status = "Under Review"
        comment = "Warden dispatched electrician"
    } | ConvertTo-Json
    $resStatus = Invoke-RestMethod -Uri "$BaseUrl/complaints/$global:ticketId/status" -Method Put -Headers $headers -Body $statusBody -ContentType "application/json" -UseBasicParsing
    if ($resStatus.data.status -ne "Under Review") {
        throw "Status update to Under Review failed"
    }

    # 5b. Add internal note
    $noteBody = @{
        text = "Internal investigation: Replacement 16A breaker ordered from storeroom."
        isInternal = $true
    } | ConvertTo-Json
    $resNote = Invoke-RestMethod -Uri "$BaseUrl/complaints/$global:ticketId/notes" -Method Post -Headers $headers -Body $noteBody -ContentType "application/json" -UseBasicParsing
    if (-not $resNote.success) {
        throw "Failed to add internal note"
    }
}

# TEST 6: Submitter Cannot See Internal Notes (CMP-007)
Run-Step "6. Verify Complainant Is Shielded from Internal Staff Notes" {
    $headers = @{ Authorization = "Bearer $studentToken" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/complaints/$global:ticketId" -Method Get -Headers $headers -UseBasicParsing

    $internalNotes = $res.data.notes | Where-Object { $_.isInternal -eq $true }
    if ($internalNotes -and $internalNotes.Count -gt 0) {
        throw "Security breach: Student was able to view internal staff notes!"
    }
}

# TEST 7: Resolving Grievance Requires Mandatory Resolution Note (CMP-008)
Run-Step "7. Enforce Mandatory Resolution Note on Closure (CMP-008)" {
    $headers = @{ Authorization = "Bearer $wardenToken" }
    $body = @{
        status = "Resolved"
        resolutionNote = ""
    } | ConvertTo-Json

    $threwError = $false
    try {
        Invoke-RestMethod -Uri "$BaseUrl/complaints/$global:ticketId/status" -Method Put -Headers $headers -Body $body -ContentType "application/json" -UseBasicParsing
    } catch {
        $threwError = $true
    }

    if (-not $threwError) {
        throw "Validation failure: System allowed resolution without a mandatory resolution note"
    }
}

# TEST 8: Successful Resolution with Resolution Note
Run-Step "8. Resolve Grievance With Full Resolution Note" {
    $headers = @{ Authorization = "Bearer $wardenToken" }
    $body = @{
        status = "Resolved"
        resolutionNote = "Electrician replaced the faulty 16A miniature circuit breaker. Tested with load up to 2000W."
        comment = "Work completed and verified"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$BaseUrl/complaints/$global:ticketId/status" -Method Put -Headers $headers -Body $body -ContentType "application/json" -UseBasicParsing
    if ($res.data.status -ne "Resolved") {
        throw "Expected status 'Resolved', got $($res.data.status)"
    }
    if (-not $res.data.resolutionNote) {
        throw "Missing resolutionNote on resolved complaint"
    }
    Write-Host "    -> Resolution Saved: $($res.data.resolutionNote)" -ForegroundColor DarkCyan
}

# TEST 9: Publish Campus Notice with Urgent & Pinned Flags (COM-001, COM-008)
Run-Step "9. Admin Publishes Urgent Pinned Announcement" {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $body = @{
        title = "Severe Weather Alert - Academic Buildings Close Early Today"
        body = "Heavy rainfall predicted in Udaipur district. All laboratory sessions and evening classes after 4:00 PM are suspended."
        priority = "Urgent"
        isPinned = $true
        targetAudience = @{
            roles = @("STUDENT", "FACULTY", "STAFF")
        }
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$BaseUrl/notices" -Method Post -Headers $headers -Body $body -ContentType "application/json" -UseBasicParsing
    if (-not $res.success -or -not $res.data._id) {
        throw "Failed to publish notice"
    }
    $global:noticeId = $res.data._id
    if (-not $res.data.isPinned) {
        throw "Notice should be pinned"
    }
    Write-Host "    -> Published Notice ID: $($global:noticeId)" -ForegroundColor DarkCyan
}

# TEST 10: In-App Notifications Verification & Mark as Read (COM-004, COM-006)
Run-Step "10. In-App Notification Delivery and Mark Read Lifecycle" {
    $headers = @{ Authorization = "Bearer $studentToken" }
    
    # 10a. Fetch notifications
    $res = Invoke-RestMethod -Uri "$BaseUrl/notifications" -Method Get -Headers $headers -UseBasicParsing
    if ($res.count -eq 0) {
        throw "Student has no in-app notifications"
    }
    $notif = $res.data[0]
    Write-Host "    -> Latest notification: '$($notif.title)'" -ForegroundColor DarkCyan

    # 10b. Mark single notification as read
    $markRes = Invoke-RestMethod -Uri "$BaseUrl/notifications/$($notif._id)/read" -Method Patch -Headers $headers -UseBasicParsing
    if (-not $markRes.data.isRead) {
        throw "Failed to mark notification as read"
    }

    # 10c. Mark all notifications as read
    $allRes = Invoke-RestMethod -Uri "$BaseUrl/notifications/read-all" -Method Patch -Headers $headers -UseBasicParsing
    if (-not $allRes.success) {
        throw "Failed to mark all notifications as read"
    }
}

$summaryColor = if ($failed -eq 0) { "Green" } else { "Red" }
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Test Results Summary: $passed Passed, $failed Failed" -ForegroundColor $summaryColor
Write-Host "==========================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}
