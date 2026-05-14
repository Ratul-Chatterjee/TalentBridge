# TalentBridge - AI-Powered Hiring Requirements Platform

A modern, full-stack web application for managing hiring requirements, candidate pipelines, and AI-assisted job description generation.

## 🚀 Features

- **Smart Intake Flow**: AI-powered conversational intake for requirements
- **Candidate Pipeline Management**: Track candidates through hiring stages
- **Job Description Generation**: AI assists in creating structured job descriptions
- **Admin Review System**: Centralized dashboard for requirement approval
- **LLM Provider Switching**: Toggle between OpenAI, Gemini, and Anthropic
- **File Management**: Upload and manage resumes and job descriptions
- **Real-time Updates**: Live status changes and notifications

## 📁 Project Structure

```
TalentBridge/
├── frontend/              # React + TypeScript UI (Vite)
│   ├── src/
│   │   ├── App.tsx       # Main routing and layout
│   │   ├── auth.tsx      # Mock authentication
│   │   ├── api.ts        # API client methods
│   │   ├── theme.ts      # Material-UI theme
│   │   └── main.tsx      # Entry point
│   ├── public/           # Static assets & favicon
│   └── package.json
│
├── backend/              # Spring Boot REST API (Java 21)
│   ├── src/main/java/com/talentbridge/api/
│   │   ├── TalentBridgeApplication.java    # Main app + controller
│   │   ├── LlmProviderService.java         # LLM integration
│   │   ├── JpaTalentBridgeStore.java       # Database service layer
│   │   ├── EnvConfig.java                  # Environment loader
│   │   ├── entities/                       # JPA entities
│   │   └── repo/                           # Spring Data repositories
│   └── pom.xml
│
├── DEPLOYMENT.md                  # Complete deployment guide
├── render.yaml                    # Render service config
└── .gitignore                     # Protects .env files
```

## 🛠️ Tech Stack

**Frontend**: React 18, TypeScript, Vite, Material-UI, React Router
**Backend**: Spring Boot 3.4.4, Java 21, JPA/Hibernate, PostgreSQL
**Database**: Supabase (PostgreSQL + Storage)
**Deployment**: Vercel (Frontend) + Render (Backend)

## 🚀 Quick Start (Local Development)

### Backend
```bash
cd backend
cp .env.example .env  # Configure with your Supabase details
mvn spring-boot:run
```
Runs on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

## 📦 Deployment to Production

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions:**

1. Set up Supabase (PostgreSQL + Storage)
2. Deploy Backend to Render
3. Deploy Frontend to Vercel
4. Configure Environment Variables
5. Run Database Migrations
6. Test Deployments

## 🔐 Security

- `.env` files are in `.gitignore` - **never commit secrets**
- Use `.env.example` as template
- Set real credentials in platform dashboards

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Mock login |
| GET | `/api/requirements` | List requirements |
| POST | `/api/requirements` | Create requirement |
| GET | `/api/candidates` | List candidates |
| POST | `/files/upload-resume` | Upload resume |
| POST | `/api/ai/parse-jd` | Parse job description |
| GET | `/api/settings/llm` | Get LLM settings |
| PUT | `/api/settings/llm` | Update LLM provider |

## 🧪 Testing

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && mvn package
```

## ✅ Checklist Before Pushing to GitHub

- [ ] Remove all `.env` files (keep only `.env.example`)
- [ ] Verify `.gitignore` includes `.env`, `node_modules/`, `target/`
- [ ] Test backend builds: `mvn clean package`
- [ ] Test frontend builds: `npm run build`
- [ ] Remove any console logs and debug statements
- [ ] Update DEPLOYMENT.md with your Supabase project details
- [ ] Create GitHub repository
- [ ] Push to GitHub

## 📝 Next Steps

1. **Create GitHub Repository**: Push this code to GitHub
2. **Set Up Supabase**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) Step 1
3. **Deploy Backend**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) Step 2
4. **Deploy Frontend**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) Step 3
5. **Configure CI/CD**: GitHub Actions will auto-deploy on push

## 🙋 Support

- **Deployment Help**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Spring Boot**: https://spring.io/projects/spring-boot
- **React**: https://react.dev
- **Supabase**: https://supabase.com/docs
2. Set `VITE_API_BASE_URL`.

## Local Run

### Install Frontend Dependencies

```powershell
Set-Location frontend
npm install
```

### Build Frontend

```powershell
Set-Location frontend
npm run build
```

### Install/Build Backend Dependencies

```powershell
Set-Location backend
..\.tools\apache-maven-3.9.9\bin\mvn.cmd -DskipTests compile
```

### Run Backend

```powershell
Set-Location backend
..\.tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

### Run Frontend

```powershell
Set-Location frontend
npm run dev
```

## Architecture

- React Router handles company/admin navigation.
- MUI provides the UI shell and responsive layout.
- The backend exposes the requirement, candidate, AI, file, and settings APIs.
- Supabase is the hosted PostgreSQL and file storage layer.

## Security and GitHub Safety

- Do not commit any `.env` file.
- Use only `.env.example` in version control.
- Service role key is backend-only and must never be exposed to frontend code.
- `.gitignore` is configured to exclude local env files, local tools, build outputs, and dependency folders.
