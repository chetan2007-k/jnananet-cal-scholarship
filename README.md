# JnanaNet – AI Powered Multilingual Scholarship Discovery Platform

🏆 AI for Bharat Hackathon 2026 Submission

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-blue)
![Node.js](https://img.shields.io/badge/backend-Node.js-green)
![AWS](https://img.shields.io/badge/cloud-AWS-orange)

## Overview
JnanaNet helps Indian students discover and apply for scholarships through a simple AI-assisted experience. The platform combines scholarship guidance, eligibility analysis, multilingual support, profile-driven workflows, and application tracking so students can move from confusion to action quickly.

## Live Demo

Frontend:  
http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com

Backend API:  
Running on AWS EC2

## How It Works

1. Student asks the AI assistant about scholarships.
2. JnanaNet analyzes eligibility criteria and user profile.
3. The system recommends suitable scholarships.
4. Students are guided to official portals to apply.

## Problem Statement
Millions of students in India miss scholarship opportunities due to:
- Lack of awareness about available schemes
- Language barriers while understanding eligibility and process
- Complex and fragmented scholarship criteria

## Solution
JnanaNet provides:
- AI scholarship assistant
- Eligibility checker
- Multilingual interface
- Scholarship portal directory
- Application guidance
- Student profile and dashboard access
- Smart filtering and scholarship comparison tools

## Features
- AI Assistant for scholarship guidance (with voice input support where available)
- Scholarship eligibility checker and recommendation engine
- Multilingual interface (English, Hindi, Tamil, Telugu)
- Student authentication, dashboard, and profile management
- Profile menu in navbar with Dashboard / My Profile / My Applications / Saved Scholarships
- Scholarship save, apply, and tracking workflow
- Dependent State → District dropdowns in profile and application forms
- “Detect My State Automatically” using browser geolocation + reverse geocoding
- Scholarship filter panel (Course, Income, State, Category, Amount, Deadline)
- AI-style natural language scholarship search
- Scholarship comparison tool (compare exactly 2 scholarships)
- State-wise scholarship availability count panel
- Floating live support chat widget
- Support ticket system and admin ticket view
- Scholarship portal directory

## Architecture

### Frontend
- React + Vite
- Hosted as static website
- Single-page app with in-app navigation (dashboard, profile, scholarships, apply, tracking, support)

### Backend
- Node.js + Express API

### Cloud Infrastructure
- Amazon S3 (frontend hosting)
- Amazon EC2 (backend server)

### AI Layer
- AI guidance engine (currently rule-based)
- Future integration with AWS Bedrock

## System Architecture

Frontend → React Web App  
Backend → Node.js API  
Cloud → AWS S3 + AWS EC2  
AI Engine → Scholarship reasoning module

_Architecture diagram will be added in `docs/`._

## Project Structure

```text
jnananet-cal-scholarship/
├── frontend/   # React application, UI, AI assistant interface
├── backend/    # Node.js server, API routes, scholarship logic
└── docs/       # Architecture diagrams and screenshots
```

### frontend/
React application, UI, AI assistant interface.

### backend/
Node.js server, API routes, scholarship logic.

### docs/
Architecture diagrams and screenshots.

## Setup Instructions

### 1) Clone Repository
```bash
git clone https://github.com/chetan2007-k/jnananet-cal-scholarship
cd jnananet-cal-scholarship
```

### 2) Install and Run Backend
```bash
cd backend
npm install
node server.js
```

### 3) Install and Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4) Build Frontend for Production
```bash
cd frontend
npm run build
```

## Scholarship Page Highlights

- Filter scholarships by Course, Income Range, State, Category, Amount, and Deadline.
- Search scholarships using natural-language queries (example: "BTech scholarships under 3 lakh income").
- Compare 2 scholarships side-by-side using the comparison table.
- View state-wise scholarship counts in the "Scholarships Available by State" panel.

## Student Profile & Application UX

- Profile page supports editing student details and saves data in browser localStorage.
- Navbar shows student profile access with quick navigation to dashboard and related pages.
- Application and profile forms support dependent State/District selection.
- One-click state detection can auto-fill state using browser geolocation permission.
- Floating support chat is available across pages.

## Screenshots

### Homepage UI
_Add screenshot here_

### AI Assistant
_Add screenshot here_

### Eligibility Checker
_Add screenshot here_

### Scholarship Recommendations
_Add screenshot here_

## Future Enhancements
- Integration with AWS Bedrock AI models
- Deeper AI-based ranking and personalization pipeline
- Scholarship data ingestion from more official state portals
- Mobile app version

## Hackathon
AI for Bharat Hackathon 2026 submission.

## License
This project is licensed under the MIT License.
