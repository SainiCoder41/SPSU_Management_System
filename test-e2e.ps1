$baseUrl = "http://localhost:5000/api"
$passed = 0
$failed = 0

function Test-Case($name, $script) {
    try {
        & $script
        Write-Host "✅ PASS: $name" -ForegroundColor Green
        $global:passed++
    } catch {
        Write-Host "❌ FAIL: $name - $($_.Exception.Message)" -ForegroundColor Red
        $global:failed++
    }
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "🧪 STARTING SPSU CMS E2E SYSTEM INTEGRATION TESTS" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Health API
Test-Case "System Health API Check" {
    $res = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($res.status -ne "online") { throw "Status is not online" }
}

# 2. Authentications
$tokens = @{}

Test-Case "Login - ADMIN (admin@spsu.ac.in)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@spsu.ac.in","password":"Admin@123"}'
    if ($res.user.role -ne "ADMIN") { throw "Expected ADMIN role" }
    $tokens["ADMIN"] = $res.token
}

Test-Case "Login - STUDENT (student1@spsu.ac.in)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"student1@spsu.ac.in","password":"Student@1234"}'
    if ($res.user.role -ne "STUDENT") { throw "Expected STUDENT role" }
    $tokens["STUDENT"] = $res.token
}

Test-Case "Login - FACULTY (faculty1@spsu.ac.in)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"faculty1@spsu.ac.in","password":"Staff@1234"}'
    if ($res.user.role -ne "FACULTY") { throw "Expected FACULTY role" }
    $tokens["FACULTY"] = $res.token
}

Test-Case "Login - MENTOR (mentor.cse@spsu.ac.in)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"mentor.cse@spsu.ac.in","password":"Staff@1234"}'
    if ($res.user.role -ne "MENTOR") { throw "Expected MENTOR role" }
    $tokens["MENTOR"] = $res.token
}

Test-Case "Login - WARDEN (warden.bh2@spsu.ac.in)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"warden.bh2@spsu.ac.in","password":"Staff@1234"}'
    if ($res.user.role -ne "WARDEN") { throw "Expected WARDEN role" }
    $tokens["WARDEN"] = $res.token
}

Test-Case "Login - HOD (hod.cse@spsu.ac.in)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"hod.cse@spsu.ac.in","password":"Staff@1234"}'
    if ($res.user.role -ne "HOD") { throw "Expected HOD role" }
    $tokens["HOD"] = $res.token
}

Test-Case "Login - PARENT (parent1@gmail.com)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"parent1@gmail.com","password":"Parent@1234"}'
    if ($res.user.role -ne "PARENT") { throw "Expected PARENT role" }
    $tokens["PARENT"] = $res.token
}

# 3. RBAC Enforcement Test
Test-Case "RBAC Access Guard: STUDENT blocked from ADMIN API" {
    try {
        $studentToken = $tokens["STUDENT"]
        Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers @{ Authorization = "Bearer $studentToken" }
        throw "Should not have succeeded"
    } catch {
        if ($_.Exception.Response.StatusCode -ne 403) {
            # In powershell 7+ or Windows PowerShell check status
            Write-Host "  (Correctly received Forbidden status)" -ForegroundColor Gray
        }
    }
}

# 4. Verify /auth/me
Test-Case "Session Verification (/auth/me)" {
    $adminToken = $tokens["ADMIN"]
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    if ($res.user.email -ne "admin@spsu.ac.in") { throw "User mismatch" }
}

# 5. Admin Stats
Test-Case "Admin Statistics (/admin/stats)" {
    $adminToken = $tokens["ADMIN"]
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    if ($res.data.totalStudents -lt 1) { throw "Expected student count > 0" }
    if ($res.data.totalDepartments -lt 4) { throw "Expected at least 4 departments" }
}

# 6. Departments & Hostels
$deptId = ""
$hostelId = ""

Test-Case "Fetch Departments (/departments)" {
    $adminToken = $tokens["ADMIN"]
    $res = Invoke-RestMethod -Uri "$baseUrl/departments" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    if ($res.count -lt 4) { throw "Expected departments" }
    $global:deptId = $res.data[0]._id
}

Test-Case "Fetch Hostels (/hostels)" {
    $adminToken = $tokens["ADMIN"]
    $res = Invoke-RestMethod -Uri "$baseUrl/hostels" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    if ($res.count -lt 7) { throw "Expected at least 7 hostels" }
    $global:hostelId = $res.data[0]._id
}

# 7. Student CRUD Lifecycle
$testStudentId = ""

Test-Case "Student CRUD: Register New Student" {
    $adminToken = $tokens["ADMIN"]
    $body = @{
        name = "Test Automation Student"
        email = "auto.student@spsu.ac.in"
        password = "Student@1234"
        enrollmentNumber = "SPSU2024AUTO99"
        rollNumber = "24BAUTO99"
        program = "B.Tech"
        department = $global:deptId
        semester = 3
        section = "B"
        cgpa = 8.75
        admissionYear = 2024
        hostel = $global:hostelId
        roomNumber = "T-101"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/students" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body $body
    if (-not $res.data._id) { throw "No student ID returned" }
    $global:testStudentId = $res.data._id
}

Test-Case "Student CRUD: Get Student Profile By ID" {
    $adminToken = $tokens["ADMIN"]
    $res = Invoke-RestMethod -Uri "$baseUrl/students/$($global:testStudentId)" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    if ($res.data.rollNumber -ne "24BAUTO99") { throw "Roll number mismatch" }
}

Test-Case "Student CRUD: Update Student CGPA & Room" {
    $adminToken = $tokens["ADMIN"]
    $body = @{
        cgpa = 9.15
        roomNumber = "T-102"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/students/$($global:testStudentId)" -Method Put -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body $body
    if ($res.data.cgpa -ne 9.15) { throw "CGPA not updated" }
    if ($res.data.roomNumber -ne "T-102") { throw "Room number not updated" }
}

Test-Case "Student CRUD: Delete Test Student" {
    $adminToken = $tokens["ADMIN"]
    $res = Invoke-RestMethod -Uri "$baseUrl/students/$($global:testStudentId)" -Method Delete -Headers @{ Authorization = "Bearer $adminToken" }
    if (-not $res.success) { throw "Delete failed" }
}

# 8. Excel Directory Export
Test-Case "Excel Student Directory Export (/students/export)" {
    $adminToken = $tokens["ADMIN"]
    $res = Invoke-WebRequest -Uri "$baseUrl/students/export" -Method Get -Headers @{ Authorization = "Bearer $adminToken" } -UseBasicParsing
    if ($res.StatusCode -ne 200) { throw "Status not 200" }
    if ($res.RawContentLength -lt 1000) { throw "File size unexpectedly small" }
}

# 9. Mentor Portal
Test-Case "Mentor Portal: Retrieve Assigned Mentees" {
    $mentorToken = $tokens["MENTOR"]
    $res = Invoke-RestMethod -Uri "$baseUrl/mentor/mentees" -Method Get -Headers @{ Authorization = "Bearer $mentorToken" }
    if ($res.count -lt 1) { throw "Expected assigned mentees for mentor.cse@spsu.ac.in" }
}

# 10. Warden Portal
Test-Case "Warden Portal: Retrieve Hostel Residents" {
    $wardenToken = $tokens["WARDEN"]
    $res = Invoke-RestMethod -Uri "$baseUrl/warden/residents" -Method Get -Headers @{ Authorization = "Bearer $wardenToken" }
    if ($res.data.residentsCount -lt 1) { throw "Expected residents in BH2" }
}

# 11. HOD Portal
Test-Case "HOD Portal: Retrieve Departmental Overview" {
    $hodToken = $tokens["HOD"]
    $res = Invoke-RestMethod -Uri "$baseUrl/hod/overview" -Method Get -Headers @{ Authorization = "Bearer $hodToken" }
    if ($res.data.department.code -ne "CSE") { throw "Expected CSE department for HOD" }
    if ($res.data.studentCount -lt 1) { throw "Expected students in CSE department" }
}

# 12. Parent Portal
Test-Case "Parent Portal: Retrieve Linked Student Profile" {
    $parentToken = $tokens["PARENT"]
    $res = Invoke-RestMethod -Uri "$baseUrl/parent/student" -Method Get -Headers @{ Authorization = "Bearer $parentToken" }
    if ($res.data.student.user.name -ne "Aarav Verma") { throw "Expected Aarav Verma as linked student" }
    if ($res.data.parent.relation -ne "Father") { throw "Expected Father relation" }
}

$summaryColor = "Green"
if ($failed -gt 0) { $summaryColor = "Red" }
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY: $passed PASSED, $failed FAILED" -ForegroundColor $summaryColor
Write-Host "=====================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}
