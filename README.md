# TalentBridge

TalentBridge is a full-stack hiring requirements platform for managing roles, candidates, resume uploads, and AI-assisted intake workflows.

## Stack

- **Frontend**: React, TypeScript, Vite, Material UI, React Router, Axios
- **Backend**: Spring Boot, Java 21, Spring Data JPA, Flyway
- **Database**: Supabase PostgreSQL and Storage
- **Auth**: Mock-only frontend auth for development

## Project Layout

```
TalentBridge/
├── frontend/
├── backend/
├── render.yaml
└── .gitignore
```

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
..\.tools\apache-maven-3.9.9\bin\mvn.cmd -DskipTests compile
..\.tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

## Build Checks

```bash
cd frontend && npm run build
cd backend && ..\.tools\apache-maven-3.9.9\bin\mvn.cmd -DskipTests clean compile
```

## Security Notes

- Do not commit any `.env` file or secret keys.
- Keep Supabase service role keys server-side only.
- Generated build outputs and dependency folders are excluded through `.gitignore`.

## API Overview

- `POST /api/auth/login` - mock login
- `GET /api/requirements` - list requirements
- `POST /api/requirements` - create requirement
- `GET /api/candidates` - list candidates
- `POST /files/upload-resume` - upload resume
- `GET /api/settings/llm` - read LLM settings
- `PUT /api/settings/llm` - update LLM provider
