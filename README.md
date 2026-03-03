# JnanaNet – AI Powered Scholarship Discovery Platform for Bharat

🏆 AI for Bharat Hackathon 2026 Submission

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-blue)
![Node.js](https://img.shields.io/badge/backend-Node.js-green)
![AWS](https://img.shields.io/badge/cloud-AWS-orange)

## Overview
JnanaNet helps students in India discover scholarships, financial aid, and government schemes through an AI-assisted experience. It provides curated scholarship options, eligibility checks, guidance responses, and redirection to trusted official scholarship portals.

## Project Links
- Frontend: http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com/
- Repository: https://github.com/chetan2007-k/jnananet-cal-scholarship

## Key Features
- AI assistant for scholarship guidance (`/api/guidance`)
- Scholarship list and details APIs (`/api/scholarships`, `/api/scholarships/:id`)
- Eligibility checking based on marks and family income (`/api/check-eligibility`)
- Scholarship recommendation endpoint (`/api/recommendations`)
- Document upload flow integrated with Amazon S3 (`/api/upload`)
- Multilingual-friendly frontend experience for student accessibility

## Architecture
JnanaNet follows a simple cloud architecture for hackathon speed and production readiness:

- **Frontend:** React + Vite static site hosted on Amazon S3
- **Backend:** Node.js + Express API running on Amazon EC2
- **AI Layer:** Scholarship query assistance via backend AI guidance service
- **Storage/Upload:** Amazon S3 for document upload handling
- **External Portals:** Redirection to official scholarship platforms (for example NSP, Buddy4Study, Vidya Lakshmi)

## High-Level Flow
`Student → Frontend Website → Backend API → AI Assistant → Scholarship Suggestion → Official Portal`

## Repository Structure

```text
jnananet-cal-scholarship/
├── backend/
│   ├── data/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
├── design.md
├── requirements.md
└── usecase.md
```

## API Endpoints

### Health
- `GET /api/health` — Backend health status

### Scholarships
- `GET /api/scholarships` — List scholarships
- `GET /api/scholarships/:id` — Scholarship by ID

### Student Guidance
- `POST /api/check-eligibility` — Evaluate eligibility from profile inputs
- `POST /api/recommendations` — Return recommendation list
- `POST /api/guidance` — Return AI guidance for scholarship queries

### Uploads
- `POST /api/upload` — Upload a document (accepted fields: `document`, `file`, `upload`)

## Local Development Setup

### 1) Clone Repository
```bash
git clone https://github.com/chetan2007-k/jnananet-cal-scholarship.git
cd jnananet-cal-scholarship
```

### 2) Run Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000` by default.

### 3) Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables (Backend)
Create a `.env` file inside `backend/` with values similar to:

```env
PORT=5000
AWS_REGION=ap-south-1
MODEL_ID=<your_model_id>
CORS_ORIGIN=http://localhost:5173,http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com
```

Add AWS credentials and S3 configuration as required by your deployment setup.

## Deployment Summary
- Frontend deployed on Amazon S3 static website hosting
- Backend deployed on Amazon EC2
- API CORS configured for S3 frontend domain and local development

## Documentation
- [System Design](design.md)
- [Requirements Specification](requirements.md)
- [Use Cases](usecase.md)

## Future Enhancements
- Multilingual AI support across more Indian languages
- Scholarship recommendation engine improvements
- Student profile-based scholarship matching
- Integration with government scholarship APIs
- Optional managed scaling with API Gateway, Lambda, and DynamoDB

## License
This project is licensed under the MIT License.
