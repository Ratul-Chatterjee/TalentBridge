@echo off
set SUPABASE_DB_URL=your_db_url_here
set SUPABASE_PROJECT_URL=your_project_url_here
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
set SERVER_PORT=8080
java -jar target\talentbridge-backend-0.1.0.jar > backend.log 2>&1
