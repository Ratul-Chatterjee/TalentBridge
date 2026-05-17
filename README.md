# TalentBridge

TalentBridge is a full-stack hiring requirements platform for managing company intake, admin review, candidate tracking, resume uploads, and switchable AI-assisted JD generation.

## Stack

- **Frontend**: React, TypeScript, Vite, Material UI, React Router, Axios
- **Backend**: Spring Boot 3.4, Java 21, Spring Data JPA, Flyway
- **Database**: Supabase PostgreSQL and Storage
- **Auth**: Mock-only frontend auth with company/admin toggle

## What This App Does

- Company users submit either a single role or a hiring drive.
- The intake flow can parse an existing JD or generate one from guided questions.
- Admin users review requirements, approve roles, manage candidate pipelines, and switch the active LLM provider.
- Supabase stores the relational data and resume files.

## Project Layout

```
TalentBridge/
├── frontend/
├── backend/
├── vercel.json
└── .gitignore
```

## Architecture

```text
React + MUI frontend  ->  Spring Boot API  ->  PostgreSQL on Supabase
						 ->  Supabase Storage for resume files
						 ->  OpenAI / Gemini / Claude via admin-selected provider
```

## Deployment

### Quick Start
- **Frontend on Vercel**: Set `VITE_API_BASE_URL` in Vercel to your public backend URL and redeploy.
- **Quick Vercel Guide**: See [VERCEL_SETUP.md](./VERCEL_SETUP.md).
- **Backend**: Deploy Spring Boot separately on Railway, Render, or any public Java host.

### Environment Variables

Frontend:
- `VITE_API_BASE_URL` — Backend API base URL (e.g., `https://api.talentbridge.com`)

Backend:
- `SUPABASE_DB_URL` — JDBC PostgreSQL connection string
- `SUPABASE_DB_USER` — Database user (usually `postgres`)
- `SUPABASE_DB_PASSWORD` — Database password
- `SUPABASE_PROJECT_URL` — Supabase project URL (e.g., `https://your-project.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (keep secret on server only)
- `SUPABASE_RESUME_BUCKET` — Storage bucket name (default: `resumes`)
- `SPRING_FLYWAY_ENABLED` — Enable/disable database migrations (default: `true`)
- `OPENAI_API_KEY` — Optional: OpenAI API key
- `GEMINI_API_KEY` — Optional: Google Gemini API key
- `ANTHROPIC_API_KEY` — Optional: Anthropic Claude API key

**⚠️ Security Note**: Never commit `.env` files or credentials to GitHub. Use Vercel/Railway/Render secrets instead.

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

## Deployed Setup

- **Frontend**: Vercel
- **Backend**: any public Java host with a stable URL
- **Database**: Supabase PostgreSQL

Set `VITE_API_BASE_URL` in Vercel to your deployed backend URL so the frontend points to the live API.

## Build Checks

```bash
cd frontend && npm run build
cd backend && ..\.tools\apache-maven-3.9.9\bin\mvn.cmd -DskipTests clean compile
```

## Design Decisions

- Kept mock auth because the assignment explicitly allows it and the core flow is product-focused.
- Used Flyway for schema control so the backend schema is predictable across environments.
- Stored the active LLM provider in the database so the admin switch works without redeploys.
- Kept storage upload logic server-side so the service role key never reaches the frontend.

## Trade-offs

- The intake flow is conversational and structured, but still deterministic enough to stay reliable.
- The admin pipeline is intentionally feature-complete for the assignment rather than enterprise-heavy.
- LLM calls fall back to structured defaults when keys are missing so the app still works in demo mode.

## Known Limitations

- No real authentication or RBAC.
- LLM quality depends on whichever provider key is configured.
- The current admin review and pipeline model is scoped to the assignment, not multi-tenant enterprise use.

## Next Steps If I Had Another Week

- Add stronger validation and autosave in the intake flow.
- Improve analytics for role fill rates and candidate conversion.
- Add richer provider-specific prompt tuning and response parsing.
- Add tests around the AI intake and pipeline updates.

## API Overview

- `POST /api/auth/login` - mock login
- `GET /api/requirements` - list requirements
- `POST /api/requirements` - create requirement
- `GET /api/candidates` - list candidates
- `POST /files/upload-resume` - upload resume
- `GET /api/settings/llm` - read LLM settings
- `PUT /api/settings/llm` - update LLM provider

## Security Notes

- Do not commit any `.env` file or secret keys.
- Keep Supabase service role keys server-side only.
- Generated build outputs and dependency folders are excluded through `.gitignore`.
