# JnanaNet – Cognitive Access Layer (CAL)

## Project Title
**JnanaNet – Cognitive Access Layer for Scholarship Access**

## Brief Project Description
JnanaNet is an AI-assisted scholarship guidance platform designed for students who face language barriers, low digital literacy, and complex online workflows. The product turns difficult scholarship steps into guided, understandable actions through literacy-aware explanations and a simple interface.

## Submission Snapshot (for Judges)
- **Category**: Inclusive GovTech / AI for Social Impact
- **Core Innovation**: Literacy-aware AI guidance for scholarship access
- **Primary Users**: First-generation and low-digital-literacy students
- **Current Stage**: Functional prototype (frontend + backend API)
- **Cloud Direction**: AWS-first architecture (EC2 + S3 + Bedrock path)

## Problem Statement
Scholarship schemes exist, but access remains unequal. Many eligible students fail to complete applications because they cannot confidently navigate eligibility rules, required documents, and form-filling steps. Existing systems often assume fluent digital behavior, stable connectivity, and formal language comprehension.

## Solution Overview
JnanaNet introduces a **Cognitive Access Layer** that sits between students and complex scholarship processes:
- Converts user questions into scholarship-focused AI prompts.
- Adapts explanations by literacy level (Low/Medium/High).
- Supports multilingual interaction choices.
- Provides a quick eligibility self-check for decision confidence.
- Includes document upload entry for future end-to-end form intelligence.

## Why This Is Innovative
- **Human-adaptive UX** instead of one-size-fits-all portal design.
- **Literacy-conditioned AI prompting** to control response complexity.
- **Low-bandwidth aware interaction model** for underserved connectivity contexts.
- **Cloud-ready architecture** that can scale from prototype to public deployment.

## Architecture
The system follows a modular frontend + API pattern with AWS-oriented deployment.

1. **Presentation Layer – React + Vite SPA**
	- Multi-page user journey (Home, About, Eligibility, Assistant).
	- Input controls for language, literacy level, and accessibility modes.

2. **Application Layer – Node.js + Express API (EC2-hosted target)**
	- Endpoint: `POST /api/guidance`.
	- Accepts `question`, `language`, and `literacy`, then builds tailored prompts.

3. **AI Reasoning Layer**
	- **Current implementation**: Hugging Face inference (`google/flan-t5-large`) via `HF_TOKEN`.
	- **AWS production path**: Amazon Bedrock for managed reasoning and recommendation generation.

4. **Storage Layer**
	- PDF upload entry point exists in UI.
	- AWS production path uses Amazon S3 for document storage and retrieval.

### AWS Service Mapping (Current Codebase)
- **Amazon EC2**: Frontend currently points to a deployed backend IP (`http://13.62.42.76:5000`).
- **Amazon S3**: Frontend build uses static-hosting compatible Vite base (`./`).
- **Amazon Bedrock**: Defined as target AI service in architecture roadmap.

## Features

### Implemented in Current Repository
- AI guidance backend endpoint with literacy-aware prompt adaptation.
- Language and literacy selectors in the frontend assistant workflow.
- Eligibility checker (marks/income/Aadhaar rule-based logic).
- Accessibility toggles (Voice Mode and Low Bandwidth mode controls).
- PDF upload input in UI for scholarship document flow.
- Structured, multi-section experience for guided navigation.

### Partially Implemented / In Progress
- Assistant input and upload controls are present in UI.
- Frontend-to-backend request dispatch for the Ask action is pending wiring.

## Tech Stack

### Frontend
- React 19
- Vite 7
- Vanilla CSS

### Backend
- Node.js
- Express 5
- Axios
- CORS
- dotenv
- Multer (installed)
- pdf-parse (installed)

### AWS Services Used / Mapped
- Amazon EC2 (backend hosting)
- Amazon S3 (static hosting + document storage path)
- Amazon Bedrock (AI reasoning target)

## Project Structure
```text
jnananet-cal-scholarship/
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js            # Express API with /api/guidance
│   └── uploads/             # Reserved upload workspace
└── frontend/
    ├── package.json
    ├── vite.config.js       # Includes base "./" for static hosting
    ├── index.html
    └── src/
        ├── main.jsx         # App bootstrap
        ├── App.jsx          # Main UX logic and page navigation
        ├── index.css        # Core UI styling
        └── App.css          # Vite template styles (legacy)
```

## How It Works
1. Student opens JnanaNet and chooses a workflow page.
2. Student reviews eligibility criteria and runs self-check.
3. Student enters scholarship query with language + literacy preference.
4. Backend endpoint prepares a literacy-specific prompt.
5. AI model returns simplified guidance response.
6. Student uses guidance to proceed with scholarship preparation.

> Current note: backend inference path is implemented; UI request wiring for Ask action is the next integration step.

## Demo Script (3–5 Minutes)
1. Show **Home** page and explain access problem.
2. Open **Eligibility** and run a quick pass/fail scenario.
3. Open **Assistant** and demonstrate language + literacy options.
4. Explain backend endpoint and current AI response generation path.
5. Close with AWS scaling path (EC2 + S3 + Bedrock migration).

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm

### 1) Install dependencies
```bash
git clone <your-repo-url>
cd jnananet-cal-scholarship

cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure environment
Create `backend/.env`:
```env
HF_TOKEN=your_huggingface_api_token
```

### 3) Run backend
```bash
cd backend
node server.js
```
Backend default URL: `http://localhost:5000`

### 4) Run frontend
```bash
cd frontend
npm run dev
```
Frontend default URL: `http://localhost:5173`

### 5) Local integration note
`frontend/src/App.jsx` contains a hardcoded EC2 API base URL. For full local testing, switch it to `http://localhost:5000`.

## Deployment

### Frontend on Amazon S3
1. Build production assets:
	```bash
	cd frontend
	npm run build
	```
2. Upload `frontend/dist/` contents to S3 static website bucket.
3. (Optional) Add CloudFront for HTTPS and edge caching.

### Backend on Amazon EC2
1. Provision EC2 and install Node.js.
2. Deploy `backend/` code and configure environment variables.
3. Start service with process manager:
	```bash
	pm2 start server.js --name jnananet-api
	```
4. Configure security groups / reverse proxy for public API access.

### Bedrock Migration Path
- Keep `/api/guidance` API contract unchanged.
- Replace Hugging Face inference call with Amazon Bedrock runtime invocation.
- Add response guardrails and prompt templates for scholarship policy accuracy.

## Expected Impact
- Reduces confusion in scholarship application journeys.
- Improves confidence for first-time digital applicants.
- Increases accessibility through language and literacy adaptation.
- Creates a replicable model for other public-service workflows.

## Future Enhancements
- Complete frontend Ask-to-backend API integration.
- Voice interaction (speech-to-text and text-to-speech).
- Real-time translation expansion across more Indian languages.
- SMS/WhatsApp guidance for low-connectivity users.
- S3-based document pipeline with extraction + recommendations.
- Bedrock-powered policy-aware recommendation engine.

## Team
- **Team Name**: JnanaNet
- **Team Lead**: Paidimarri Krishna Chetan


