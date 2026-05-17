@echo off
cd %~dp0
rem This script expects environment variables to be provided (e.g. via backend/.env or your shell):
rem SUPABASE_DB_URL, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD, SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY
rem See backend/.env.example for required variables. Do NOT commit real secrets.
set SERVER_PORT=8080
set SPRING_FLYWAY_ENABLED=false
java -jar target\talentbridge-backend-0.1.0.jar
