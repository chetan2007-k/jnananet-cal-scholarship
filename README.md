# JnanaNet – AI Scholarship Access Layer

JnanaNet is a hackathon-ready, AI-powered scholarship assistance platform built for students who struggle with language barriers, low digital literacy, and complex application workflows.

## Hackathon Snapshot
- **Theme**: AI for Social Impact / Inclusive Education
- **Problem**: Eligible students miss scholarships due to process complexity
- **Solution**: Literacy-aware, multilingual AI guidance + recommendation flow
- **Cloud Stack**: Amazon EC2 + Amazon S3 + Amazon Bedrock
- **Status**: Working full-stack prototype with deployable backend APIs

## Live Links
- **Frontend (S3 Website)**: http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com/
- **Backend (EC2)**: http://13.62.42.76:5000/
- **Health Check**: http://13.62.42.76:5000/api/health

## Core Features
- Multilingual scholarship assistant (English, Hindi, Tamil, Telugu)
- Literacy-aware AI response style (Low / Medium / High)
- Eligibility checker with score and recommendation hints
- Scholarship recommendation engine with match score + reasoning
- Scholarship portals directory (Govt, private, NGO, international)
- Application submission + tracking history UI
- Upload endpoint prepared for Amazon S3 document storage

## Architecture

### 1) Frontend Layer (React + Vite)
- Rich single-page experience with sections: Home, Eligibility, Apply, Track, AI Assistant, Stories, Portals, FAQ, Contact
- Uses configurable API base via `VITE_API_BASE`
- Responsive moonlight-themed UI optimized for demo storytelling

### 2) Backend Layer (Node.js + Express)
- Modular Express codebase:
	- `backend/server.js`
	- `backend/routes/api.js`
	- `backend/services/bedrockService.js`
	- `backend/services/recommendationService.js`
	- `backend/services/s3UploadService.js`
	- `backend/data/scholarships.js`
- CORS configured for S3 frontend domain (with env override)

### 3) AI Layer (Amazon Bedrock)
- `/api/guidance` builds literacy-aware prompts and invokes Bedrock model
- Model driven by `MODEL_ID` and `AWS_REGION`

### 4) Storage Layer (Amazon S3)
- `/api/upload` accepts file uploads and pushes to S3 when `S3_BUCKET` is configured
- Graceful fallback response when S3 is not yet configured

## API Endpoints

### `GET /api/health`
Returns deployment readiness metadata:
```json
{
	"status": "Server running",
	"service": "JnanaNet Backend",
	"ai": "Amazon Bedrock",
	"compute": "EC2",
	"storage": "S3"
}
```

### `GET /api/scholarships`
Returns locally curated scholarship dataset.

### `POST /api/guidance`
Body:
```json
{
	"question": "Scholarships for B.Tech students",
	"language": "English",
	"literacy": "Medium"
}
```

### `POST /api/recommendations`
Body:
```json
{
	"percentage": 78,
	"income": 300000,
	"category": "OBC",
	"course": "B.Tech"
}
```

### `POST /api/upload`
- Accepts multipart file fields: `document`, `file`, or `upload`
- Uploads to S3 when configured

## Local Setup

### Prerequisites
- Node.js 18+
- npm

### 1) Install dependencies
```bash
git clone https://github.com/chetan2007-k/jnananet-cal-scholarship.git
cd jnananet-cal-scholarship

cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure backend env
Create `backend/.env` from `backend/.env.example`:
```env
PORT=5000
AWS_REGION=ap-south-1
MODEL_ID=amazon.titan-text-lite-v1
# CORS_ORIGIN=http://localhost:5173,http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com
# S3_BUCKET=your-s3-bucket-name
```

### 3) Run backend
```bash
cd backend
npm start
```

### 4) Run frontend
```bash
cd frontend
npm run dev
```

Optional local API override:
```bash
# PowerShell
$env:VITE_API_BASE="http://localhost:5000"
npm run dev
```

## Deployment Guide

### Backend on EC2
```bash
cd ~/jnananet-cal-scholarship
git pull origin main
cd backend
npm install
pm2 restart jnananet-backend || pm2 start server.js --name jnananet-backend --cwd ~/jnananet-cal-scholarship/backend
curl -s http://localhost:5000/api/health
```

### Frontend on S3
```bash
cd frontend
npm run build
aws s3 sync dist s3://jnananet-frontend-chetan --delete --region eu-north-1
```

## Hackathon Demo Flow (3–5 min)
1. Show the access problem and JnanaNet value proposition
2. Run eligibility check with a sample student profile
3. Ask AI assistant in a selected language/literacy mode
4. Show recommendation ranking and reasoning cards
5. Open live health endpoint to prove cloud backend readiness

## Impact
- Increases scholarship discoverability for underserved students
- Reduces form confusion with adaptive AI explanation
- Improves trust through clear recommendations and traceable flow
- Provides a scalable cloud-native foundation for public education services

## Team
- **Team Name**: JnanaNet
- **Team Lead**: Paidimarri Krishna Chetan


