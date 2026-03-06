# JnanaNet – AI Powered Scholarship Intelligence Platform

🏆 AI for Bharat Hackathon 2026 Submission

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-blue)
![Node.js](https://img.shields.io/badge/backend-Node.js-green)
![AWS](https://img.shields.io/badge/cloud-AWS-orange)

## Overview
JnanaNet is an AI-powered scholarship intelligence and decision-support platform that predicts eligibility, estimates success probability, and guides students through the application process using multilingual AI assistance.

The platform is designed for real-world student workflows: profile submission, eligibility interpretation, explainable scoring, comparative decision analysis, and guided next actions.

## Project Links
- Frontend: http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com/
- Repository: https://github.com/chetan2007-k/jnananet-cal-scholarship

## Key Intelligence Features
- **Eligibility Prediction Engine** — Evaluates candidate fit using profile and scholarship criteria.
- **Success Probability Scoring** — Estimates application success likelihood with interpretable scoring signals.
- **What-If Simulation** — Models profile adjustments (for example marks or income changes) to analyze potential outcomes.
- **Smart Insight Generator** — Produces actionable guidance based on profile quality and scholarship fit.
- **AI Verdict Recommendation** — Tags opportunities with recommendation confidence for faster decisions.
- **Comparison Intelligence** — Compares shortlisted scholarships side-by-side for strategic selection.
- **Profile Strength Meter** — Quantifies profile completeness and competitiveness.
- **Risk Indicator** — Highlights potential rejection risk and sensitivity factors.
- **Multilingual AI Assistant** — Supports guidance-oriented interaction for broader accessibility.

## System Highlights
- **Real-world workflow coverage** from discovery to submission readiness.
- **Decision-support design** focused on measurable, actionable outcomes.
- **Explainable scoring** to improve user trust and reviewer transparency.
- **Interactive analytics** for student and admin-level visibility.

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node + Express
- **AI:** Amazon Bedrock
- **Storage:** AWS S3

## Demo Flow
`Profile → Eligibility → Probability → What-If → Compare → AI Chat`

## Architecture Snapshot
- **Frontend:** React + Vite static site hosted on Amazon S3.
- **Backend:** Node.js + Express APIs handling profile analysis, eligibility, recommendations, and guidance.
- **AI Layer:** Bedrock-backed guidance service for conversational scholarship support.
- **Storage/Upload:** Amazon S3 integrated upload flow.

## API Endpoints

### Health
- `GET /api/health` — Backend health status.

### Scholarships
- `GET /api/scholarships` — List scholarships.
- `GET /api/scholarships/:id` — Scholarship by ID.

### Intelligence + Guidance
- `POST /api/check-eligibility` — Rule-based eligibility evaluation.
- `POST /api/ml-eligibility` — ML-based eligibility probability and explanation.
- `POST /api/recommendations` — Scholarship recommendations.
- `POST /api/guidance` — AI guidance response.

### Uploads
- `POST /api/upload` — Upload a document (accepted fields: `document`, `file`, `upload`).

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
Create a `.env` file inside `backend/`:

```env
PORT=5000
AWS_REGION=ap-south-1
MODEL_ID=<your_model_id>
CORS_ORIGIN=http://localhost:5173,http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com
```

Add AWS credentials and S3 configuration according to your deployment environment.

## Documentation
- [System Design](design.md)
- [Requirements Specification](requirements.md)
- [Use Cases](usecase.md)

## License
This project is licensed under the MIT License.
