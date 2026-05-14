# TalentBridge Deployment Guide

## Overview
TalentBridge is a full-stack hiring requirements management platform with:
- **Frontend**: React + TypeScript + Material-UI (deployed on Vercel)
- **Backend**: Spring Boot + PostgreSQL (deployed on Render)
- **Database**: Supabase (PostgreSQL + Storage)

## Prerequisites

1. **Supabase Account** - https://supabase.com
2. **Vercel Account** - https://vercel.com
3. **Render Account** - https://render.com
4. **GitHub Repository** - Push this code to GitHub first

---

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project
1. Log in to https://supabase.com
2. Create a new project
3. Wait for initialization (~2 minutes)
4. Go to **Project Settings > Database** to get:
   - Host: `db.YOUR-PROJECT-ID.supabase.co`
   - Username: `postgres`
   - Password: (set during project creation)
   - Database: `postgres`

### 1.2 Create Storage Buckets
1. Go to **Storage > Buckets**
2. Create two public buckets:
   - `resumes` - for candidate resumes
   - `jds` - for job descriptions

### 1.3 Get Service Role Key
1. Go to **Project Settings > API**
2. Copy **Service Role Key** (keep this secret!)
3. Also copy **Project URL**

### 1.4 Run Database Migrations
1. Connection string format:
```
jdbc:postgresql://db.YOUR-PROJECT-ID.supabase.co:5432/postgres?sslmode=require
```

---

## Step 2: Deploy Backend to Render

### 2.1 Prepare Backend
1. Ensure `pom.xml` has all dependencies
2. Verify `application.properties` uses environment variables

### 2.2 Create Render Service
1. Log in to https://render.com
2. Click **New +** > **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `talentbridge-api`
   - **Region**: Closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Java`
   - **Build Command**: `mvn -DskipTests clean package`
   - **Start Command**: `java -jar target/talentbridge-backend-0.1.0.jar`

### 2.3 Add Environment Variables to Render
Go to **Environment** and add:
```
SUPABASE_DB_URL=jdbc:postgresql://db.YOUR-PROJECT-ID.supabase.co:5432/postgres?sslmode=require
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=YOUR_SUPABASE_PASSWORD
SUPABASE_PROJECT_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_RESUME_BUCKET=resumes
SUPABASE_JD_BUCKET=jds
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
SERVER_PORT=8080
```

### 2.4 Deploy
Click **Create Web Service**. Render will automatically deploy when you push to GitHub.

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend
1. Update `frontend/.env.production` with your backend URL:
```
VITE_API_BASE_URL=https://talentbridge-api.onrender.com
```
(Replace with your actual Render URL)

### 3.2 Deploy to Vercel
1. Log in to https://vercel.com
2. Click **Add New** > **Project**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: `Other`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variables
In Vercel project settings, add:
```
VITE_API_BASE_URL=https://talentbridge-api.onrender.com
```

### 3.4 Deploy
Click **Deploy**. Vercel will automatically deploy on every push to `main`.

---

## Step 4: Verify Deployment

### 4.1 Test Backend API
```bash
curl https://talentbridge-api.onrender.com/api/settings/llm
```

Expected response:
```json
{
  "id": 1,
  "activeProvider": "openai",
  "updatedAt": "2026-05-13T..."
}
```

### 4.2 Test Frontend
Open https://YOUR-VERCEL-URL.vercel.app

Log in with:
- Role: Admin or Company User
- (Mock auth - any credentials work)

---

## Environment Variables Reference

### Backend (Render)
| Variable | Example | Required |
|----------|---------|----------|
| `SUPABASE_DB_URL` | `jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require` | ✓ |
| `SUPABASE_DB_USER` | `postgres` | ✓ |
| `SUPABASE_DB_PASSWORD` | `your-password` | ✓ |
| `SUPABASE_PROJECT_URL` | `https://xxx.supabase.co` | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | ✓ |
| `OPENAI_API_KEY` | `sk-...` |  |
| `GEMINI_API_KEY` | `...` |  |
| `ANTHROPIC_API_KEY` | `...` |  |

### Frontend (Vercel)
| Variable | Example |
|----------|---------|
| `VITE_API_BASE_URL` | `https://talentbridge-api.onrender.com` |

---

## Monitoring & Logs

### Render Logs
1. Go to your service in Render
2. Click **Logs** tab to see real-time logs

### Vercel Logs
1. Go to your project in Vercel
2. Click **Deployments** > Select deployment > **Logs**

---

## Troubleshooting

### Backend won't start
- Check **Render Logs** for errors
- Verify all environment variables are set
- Ensure Supabase database is accessible

### Frontend can't connect to API
- Verify `VITE_API_BASE_URL` is correct
- Check browser console for CORS errors
- Ensure backend is running

### Database migration fails
- Verify `SUPABASE_DB_URL` connection string
- Check SSL mode is set to `require`
- Verify database credentials

---

## Local Development

### Run Backend Locally
```bash
cd backend
export $(cat .env | xargs)
mvn spring-boot:run
```

### Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

---

## Security Checklist

- [ ] Never commit `.env` files with real secrets
- [ ] Use only `.env.example` in version control
- [ ] Rotate Supabase service role key periodically
- [ ] Enable HTTPS on all endpoints
- [ ] Set up proper CORS rules
- [ ] Use strong database passwords

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev

