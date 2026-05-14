# TalentBridge Backend: Supabase Connection Troubleshooting

## Current Status ✅ PARTIALLY FIXED

### What We Fixed
1. ✅ **Environment variables loading** - Created `EnvConfig.java` with dotenv4j
   - `.env` file is now automatically loaded at Spring Boot startup
   - All Supabase credentials are properly injected into `application.properties`
   
2. ✅ **Backend compilation** - All code compiles cleanly with JPA entities and repositories
   - 7 JPA entities created (Company, Requirement, Role, Candidate, InterviewRound, CandidateNote, LlmSettings)
   - 7 Spring Data repositories configured
   - Flyway migrations prepared (V1__init.sql)

### Current Blocker 🔴 DNS Resolution
```
Error: Name resolution of db.ffyptptkuxvqattkclil.supabase.co failed
```

**Root Cause**: Your system's default DNS resolver cannot resolve the Supabase hostname.
**Status**: Supabase hostname DOES resolve when using Google Public DNS (8.8.8.8)

## Solutions (Choose One)

### Solution 1: Use DNS Fix Script (Requires Admin Privilege)
Windows PowerShell (Run as Administrator):
```powershell
cd c:\Users\KIIT\Desktop\Project\TalentBridge\backend
powershell -NoProfile -ExecutionPolicy Bypass -File "..\run-backend-with-dns.ps1"
```

### Solution 2: Manual DNS Configuration (Permanent)
Windows Settings:
1. Open **Settings** → **Network & Internet** → **Advanced network settings**
2. Find your active network adapter
3. Click **Edit** → **DNS server assignment**
4. Change from "Automatic (DHCP)" to "Manual"
5. Add IPv4 addresses:
   - Primary: `8.8.8.8` (Google)
   - Secondary: `8.8.4.4` (Google)
6. Toggle ON to apply
7. Run backend: `mvn spring-boot:run`

### Solution 3: Use Different Network
- Try mobile hotspot
- Try public WiFi
- Try different ISP DNS if available

### Solution 4: Corporate/VPN Setup
If you're behind a corporate proxy:
1. Configure Maven to use your proxy (see `.m2/settings.xml`)
2. Configure Java system properties for proxy

## Testing After DNS Fix

```powershell
# Verify DNS resolution works
nslookup db.ffyptptkuxvqattkclil.supabase.co 8.8.8.8

# Run backend (from backend directory)
..\.tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run

# In another terminal, test API
curl http://localhost:8080/api/settings/llm
```

## Expected Success Output
```
2026-05-13T13:XX:XX...  INFO ... : Flyway migrations completed successfully
2026-05-13T13:XX:XX...  INFO ... : Started TalentBridgeApplication in 8.345 seconds
```

## Files Modified
- `backend/pom.xml` - Added dotenv4j dependency
- `backend/src/main/java/com/talentbridge/api/EnvConfig.java` - Auto-loader (NEW)
- `backend/src/main/resources/application.properties` - Removed failed config import
- `run-backend-with-dns.ps1` - DNS fix script (NEW)

## Next Steps (Once Backend Runs)
1. Test API endpoints: `GET /api/settings/llm`
2. Verify database schema created: Check Supabase SQL Editor
3. Wire frontend to backend API endpoints
4. Implement LLM provider switching

## Contact Diagnostics
If none of these solutions work:
1. Run `ipconfig /all` and check current DNS servers
2. Try `ping google.com` and `ping db.ffyptptkuxvqattkclil.supabase.co` 
3. Check if corporate proxy is blocking DNS/ports
4. Verify Supabase project status at https://app.supabase.com
